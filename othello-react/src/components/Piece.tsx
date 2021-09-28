import React from 'react'

type Props = {
    color: number
}

const Piece: React.FC<Props> = ({ color }) => {
    return (
        <>
            {color === 0 ?
                <div className='hint-disk' ></div> 
                : 
                (
                    color === 1 ? 
                    <div className='black-disk'></div> :
                    <div className='white-disk'></div> 
                )
            }
        </>
    )
}

export default Piece
