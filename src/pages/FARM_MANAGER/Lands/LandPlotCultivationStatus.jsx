import React from 'react'
import PropTypes from 'prop-types'

import {
  getCultivationCropName,
  getCultivationLogbookName,
  getCultivationStatusMeta,
} from './landPlotUtils'

const LandPlotCultivationStatus = ({ plot, showContext = false }) => {
  const meta = getCultivationStatusMeta(plot)
  const logbookName = getCultivationLogbookName(plot)
  const cropName = getCultivationCropName(plot)

  return (
    <div className="space-y-1">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${meta.badgeClass}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
        {meta.label}
      </span>
      {showContext && meta.status !== 'AVAILABLE' && (logbookName || cropName) && (
        <div className="text-xs text-slate-500">
          {logbookName && <div>Nhật ký: {logbookName}</div>}
          {cropName && <div>Cây trồng: {cropName}</div>}
        </div>
      )}
    </div>
  )
}

LandPlotCultivationStatus.propTypes = {
  plot: PropTypes.object,
  showContext: PropTypes.bool,
}

export default LandPlotCultivationStatus
