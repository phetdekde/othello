import React from 'react'

type Props = {
    color: number
}

const Piece: React.FC<Props> = ({ color }) => {
    return (
        <>
            {color === 1 ? 
                <div style={{width: '75%', height: '75%', borderRadius: '50%', backgroundImage: 'radial-gradient(#333333 30%, black 70%', margin: '0 auto'}}></div> :
                <div style={{width: '75%', height: '75%', borderRadius: '50%', backgroundImage: 'radial-gradient(white 30%, #cccccc 70%', margin: '0 auto'}}></div> 
            }
        </>
    )
}

export default Piece
