import React from 'react'

const SummeryPreview = ({resumeInfo}) => {
  return (
    <div className='text-xs'>
      <p>
        {resumeInfo?.summery}
      </p>
    </div>
  )
}

export default SummeryPreview
