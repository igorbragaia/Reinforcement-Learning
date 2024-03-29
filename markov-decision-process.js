const script = () => {
    const rowsLength = 4, columnsLength = 8, learningRate = 0.8

    let previousUtilities = Array(4).fill().map(() => Array(8).fill(0)), 
        currentUtilities = Array(4).fill().map(() => Array(8).fill(0)), 
        maxUtility = 0,
        delta = 100000,
        deltas = []

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
        }))
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
        return matrix
    })()

    const move = ( row, column, dx, dy ) => {
        const newRow = row + dx, newColumn = column + dy
        if(!(newRow >= 0 && newRow < rowsLength && newColumn >= 0 && newColumn < columnsLength))
            return { row, column, extraCost: -1 }
        else
            return { row: newRow, column: newColumn, extraCost: 0 }
    }

    const bestMovement = ( row, column ) => {        
        if(reward[row][column].restart)
            return 'RESTART'

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
            for(let column=0; column<columnsLength; column++){
                if(reward[row][column].restart){
                    currentUtilities[row][column] = reward[row][column].reward + reward[row][column].cost +
                    learningRate * (previousUtilities.flat().reduce((a,b) => a + b, 0) / previousUtilities.flat().length)
                } else {
                    const leftMovement = move( row, column, 0, -1 ),
                        rightMovement = move( row, column, 0, 1),
                        upMovement = move( row, column, -1, 0),
                        downMovement = move( row, column, 1, 0)
                        
                    currentUtilities[row][column] = Math.max(currentUtilities[row][column], 
                        reward[row][column].reward + reward[row][column].cost +
                        learningRate * ( upMovement.extraCost +
                        0.7 * previousUtilities[upMovement.row][upMovement.column] +
                        0.2 * previousUtilities[leftMovement.row][leftMovement.column] +
                        0.1 * previousUtilities[rightMovement.row][rightMovement.column])
                    )
                    currentUtilities[row][column] = Math.max(currentUtilities[row][column], 
                        reward[row][column].reward + reward[row][column].cost +
                        learningRate * ( leftMovement.extraCost +
                        0.7 * previousUtilities[leftMovement.row][leftMovement.column] +
                        0.2 * previousUtilities[downMovement.row][downMovement.column] +
                        0.1 * previousUtilities[upMovement.row][upMovement.column])
                    )
                    currentUtilities[row][column] = Math.max(currentUtilities[row][column], 
                        reward[row][column].reward + reward[row][column].cost +
                        learningRate * ( downMovement.extraCost +
                        0.7 * previousUtilities[downMovement.row][downMovement.column] +
                        0.2 * previousUtilities[rightMovement.row][rightMovement.column] +
                        0.1 * previousUtilities[leftMovement.row][leftMovement.column])
                    )
                    currentUtilities[row][column] = Math.max(currentUtilities[row][column], 
                        reward[row][column].reward + reward[row][column].cost +
                        learningRate * ( leftMovement.extraCost +
                        0.7 * previousUtilities[leftMovement.row][leftMovement.column] +
                        0.2 * previousUtilities[downMovement.row][downMovement.column] +
                        0.1 * previousUtilities[upMovement.row][upMovement.column])
                    )
                }            
                maxUtility = Math.max(maxUtility, currentUtilities[row][column])
            }

        for(let row=0; row<rowsLength; row++)
            for(let column=0; column<columnsLength; column++)
                document.getElementsByClassName("col")[row * columnsLength + column].textContent = bestMovement(row, column)
        delta = Math.round(100 * (currentUtilities.flat().reduce((a,b) => a + b, 0) - previousUtilities.flat().reduce((a,b) => a + b, 0))) / 100   
        deltas = [...deltas, delta]             
    }

    const run = () => {
        updateState()
        document.getElementById("iteration").textContent = `iteration ${iteration}`
        document.getElementById("delta").textContent = `Sum Utility(current state) - Sum Utility(previous state) = ${delta}`
        
        if(delta == 0){
            document.getElementById("iteration").textContent = `iteration ${iteration} - CONVERGED!`
            document.getElementById("policy").textContent = `OPTIMAL Markov Decision Process policy`
            console.log(deltas)
        }
        else {
            iteration += 1
            setTimeout(() => {
                run()
            }, 500)
        }
    }

    run()
}