const run = () => {
    const rowsLength = 4, columnsLength = 8

    let previousUtilities, 
        currentUtilities = Array(4).fill().map(() => Array(8).fill(0)), 
        hash = Array(4).fill().map(() => Array(8).fill(0))
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
        for(let position of PITPositions)
            matrix[position.row][position.column] = { reward: -100, cost: -0.1, restart: true }
        for(let position of GoldPositions)
            matrix[position.row][position.column] = { reward: 100, cost: -0.1, restart: true }
        for(let position of MonsterPositions)
            matrix[position.row][position.column] = { reward: -50, cost: -0.1, restart: true }        
        return matrix;
    })()

    const move = ( row, column, dx, dy ) => {
        const newRow = row + dx, newColumn = column + dy
        if(!(newRow >= 0 && newRow < rowsLength && newColumn >= 0 && newColumn < columnsLength))
            return { row, column }
        else
            return { row: newRow, column: newColumn }
    }

    const drawState = ( row, column ) => {
        const leftMovement = move( row, column, 0, -1 ),
            rightMovement = move( row, column, 0, 1),
            upMovement = move( row, column, 1, 0),  
            downMovement = move( row, column, -1, 0)

        let maxNeighborsUtility = currentUtilities[row][column], draw = { row, column }
        if(currentUtilities[leftMovement.row][leftMovement.column] >= maxNeighborsUtility){
            draw = leftMovement
            maxNeighborsUtility = currentUtilities[leftMovement.row][leftMovement.column]
        }
        if(currentUtilities[rightMovement.row][rightMovement.column] >= maxNeighborsUtility){
            draw = rightMovement
            maxNeighborsUtility = currentUtilities[rightMovement.row][rightMovement.column]
        }
        if(currentUtilities[upMovement.row][upMovement.column] >= maxNeighborsUtility){
            draw = upMovement
            maxNeighborsUtility = currentUtilities[upMovement.row][upMovement.column]
        }    
        if(currentUtilities[downMovement.row][downMovement.column] >= maxNeighborsUtility){
            draw = downMovement
            maxNeighborsUtility = currentUtilities[downMovement.row][downMovement.column]
        }
        if( hash[draw.row][draw.column] == 0 && document.getElementsByClassName("col")[draw.row * columnsLength + draw.column].style.backgroundColor === `rgba(255, 0, 0, 0)`){
            hash[draw.row][draw.column] = 1
            const color = `rgba(255, 0, 0, ${currentUtilities[row][column]/maxUtility})`
            document.getElementsByClassName("col")[row * columnsLength + column].style.backgroundColor = color
            setTimeout(() => {
                drawState(draw.row, draw.column)
            }, 200);
        } else {
            if(iteration < 1000)
                setTimeout(() => {
                    updateState()
                }, 200);
            else
                document.getElementById("iteration").textContent = `iteration: ${iteration}, FINISHED!`
        }
    }

    const updateState = () => {
        previousUtilities = currentUtilities
        currentUtilities = Array(4).fill().map(() => Array(8).fill(0))
        maxUtility = 0
        for(let row=0; row<rowsLength; row++)
            for(let column=0; column<columnsLength; column++) {
                const leftMovement = move( row, column, 0, -1 ),
                    rightMovement = move( row, column, 0, 1),
                    upMovement = move( row, column, 1, 0),
                    downMovement = move( row, column, -1, 0)
                    
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

        document.getElementById("iteration").textContent = `iteration: ${iteration}`
        iteration += 1
        for(let row=0; row<rowsLength; row++)
            for(let column=0; column<columnsLength; column++)
                document.getElementsByClassName("col")[row * columnsLength + column].style.backgroundColor = `rgba(255, 0, 0, 0)`
        hash = Array(4).fill().map(() => Array(8).fill(0))        
        drawState( Math.floor(Math.random() * rowsLength), Math.floor(Math.random() * columnsLength) ) 
    }
    updateState()
}