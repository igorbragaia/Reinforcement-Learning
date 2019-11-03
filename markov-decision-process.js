const script = () => {
    const rowsLength = 4, columnsLength = 8

    let previousUtilities, 
        currentUtilities = Array(4).fill().map(() => Array(8).fill(0)), 
        maxUtility = 0

    let iteration = 1

    let reward = (() => {
        const PITPositions = [
            { row: 0, column: 1 },
            { row: 0, column: 6 },
            { row: 1, column: 2 },
            { row: 1, column: 6 },
            { row: 3, column: 2 },
            { row: 3, column: 6 },
        ], GoldPositions = [
            { row: 1, column: 1 },
            { row: 2, column: 5 },
        ], MonsterPositions = [
            { row: 1, column: 0 },
            { row: 2, column: 4 },
        ]
        let matrix = Array(rowsLength).fill().map(() => Array(columnsLength).fill().map(_ => {
            return { reward: 0, cost: -0.1, restart: false }
        }));
        for(let position of PITPositions){
            matrix[position.row][position.column] = { reward: -100, cost: -0.1, restart: true }
            document.getElementsByClassName("col")[position.row * columnsLength + position.column].style.backgroundColor = 'rgb(128,128,128)'
        }
        for(let position of GoldPositions){
            matrix[position.row][position.column] = { reward: 100, cost: -0.1, restart: true }
            document.getElementsByClassName("col")[position.row * columnsLength + position.column].style.backgroundColor = 'yellow'
        }
        for(let position of MonsterPositions){
            matrix[position.row][position.column] = { reward: -50, cost: -0.1, restart: true }       
            document.getElementsByClassName("col")[position.row * columnsLength + position.column].style.backgroundColor = 'rgb(255,99,71)'
        }
        return matrix;
    })()

    const move = ( row, column, dx, dy ) => {
        const newRow = row + dx, newColumn = column + dy
        if(!(newRow >= 0 && newRow < rowsLength && newColumn >= 0 && newColumn < columnsLength))
            return { row, column }
        else
            return { row: newRow, column: newColumn }
    }

    const bestMovement = ( row, column ) => {
        const leftMovement = move( row, column, 0, -1 ),
            rightMovement = move( row, column, 0, 1),
            upMovement = move( row, column, -1, 0),  
            downMovement = move( row, column, 1, 0)

        let maxNeighborsUtility = currentUtilities[leftMovement.row][leftMovement.column], movement = 'LEFT'
        if(currentUtilities[rightMovement.row][rightMovement.column] >= maxNeighborsUtility){
            movement = 'RIGHT'
            maxNeighborsUtility = currentUtilities[rightMovement.row][rightMovement.column]
        }
        if(currentUtilities[upMovement.row][upMovement.column] >= maxNeighborsUtility){
            movement = 'UP'
            maxNeighborsUtility = currentUtilities[upMovement.row][upMovement.column]
        }    
        if(currentUtilities[downMovement.row][downMovement.column] >= maxNeighborsUtility){
            movement = 'DOWN'
            maxNeighborsUtility = currentUtilities[downMovement.row][downMovement.column]
        }
        return movement
    }

    const updateState = () => {
        previousUtilities = currentUtilities
        currentUtilities = Array(4).fill().map(() => Array(8).fill(0))
        maxUtility = 0
        for(let row=0; row<rowsLength; row++)
            for(let column=0; column<columnsLength; column++) {
                const leftMovement = move( row, column, 0, -1 ),
                    rightMovement = move( row, column, 0, 1),
                    upMovement = move( row, column, -1, 0),
                    downMovement = move( row, column, 1, 0)
                    
                currentUtilities[row][column] = Math.max(currentUtilities[row][column], 
                    reward[row][column].reward + reward[row][column].cost +
                    0.7 * previousUtilities[upMovement.row][upMovement.column] +
                    0.2 * previousUtilities[leftMovement.row][leftMovement.column] +
                    0.1 * previousUtilities[rightMovement.row][rightMovement.column]
                )
                currentUtilities[row][column] = Math.max(currentUtilities[row][column], 
                    reward[row][column].reward + reward[row][column].cost +
                    0.7 * previousUtilities[leftMovement.row][leftMovement.column] +
                    0.2 * previousUtilities[downMovement.row][downMovement.column] +
                    0.1 * previousUtilities[upMovement.row][upMovement.column]
                )
                currentUtilities[row][column] = Math.max(currentUtilities[row][column], 
                    reward[row][column].reward + reward[row][column].cost +
                    0.7 * previousUtilities[downMovement.row][downMovement.column] +
                    0.2 * previousUtilities[rightMovement.row][rightMovement.column] +
                    0.1 * previousUtilities[leftMovement.row][leftMovement.column]
                )
                currentUtilities[row][column] = Math.max(currentUtilities[row][column], 
                    reward[row][column].reward + reward[row][column].cost +
                    0.7 * previousUtilities[leftMovement.row][leftMovement.column] +
                    0.2 * previousUtilities[downMovement.row][downMovement.column] +
                    0.1 * previousUtilities[upMovement.row][upMovement.column]
                )
                maxUtility = Math.max(maxUtility, currentUtilities[row][column])
            }            

        let updates = 0, bestMov
        for(let row=0; row<rowsLength; row++)
            for(let column=0; column<columnsLength; column++){
                bestMov = bestMovement(row, column)
                if(document.getElementsByClassName("col")[row * columnsLength + column].textContent !== bestMov){
                    updates += 1
                    document.getElementsByClassName("col")[row * columnsLength + column].textContent = bestMov
                }
            }
        return updates > 0
    }

    const run = () => {
        document.getElementById("iteration").textContent = `iteration ${iteration}`
        if(!updateState()){
            document.getElementById("iteration").textContent = `iteration ${iteration} - CONVERGED!`
            document.getElementById("policy").textContent = `OPTIMAL Markov Decision Process policy`
        }
        else {
            iteration += 1
            setTimeout(() => {
                run()
            }, 1000)
        }
    }

    run()
}