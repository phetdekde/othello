import React from 'react'

type Props = {
    label: string
}

const Label: React.FC<Props> = ({ label }) => {
    return (
        <>
            <h2 className='label'>{label}</h2>
        </>
    )
}

export default Label
