import { useRef } from 'react'


export default HorzBarChart


function HorzBarChart({
  chartType,
  rowLabels,
  rowData,
  formatRowLabel,
  formatBarLabel,
  chartCfg
}) {
  const minVal = Math.min(...rowData)
  const maxVal = Math.max(...rowData)
  const valSpan = computeSpanByZero(
    minVal,
    maxVal
  )

  return (
    <div
      className={`chart-container ${chartType}`}
    >
      <ol
        className="horz-bar-chart"
        style={{
          '--cfg-bar-scale-factor':
            `calc((0.9 * var(--content-width)) / max(1, ${valSpan}))`,
          '--cfg-row-gap-scale': '3',
          '--cfg-column-gap-scale': '5',
          '--cfg-label-internal-padding-scale': '0.8',
          '--cfg-bar-height': 'calc(4.5 * var(--vh-unit))',
          '--cfg-label-font-scale': '1.2',
          '--cfg-label-font-weight': 'bold',
          '--cfg-min-value': minVal,

          ...chartCfg
        }}
      >
        {
          rowLabels.map((label, idx) => (
            <li
              aria-label={formatRowLabel(label,idx)}
              title={formatRowLabel(label, idx)}
              data-bar-label={label}
              key={idx}
            >
              <i
                aria-hidden="hidden"
                data-value-label={formatBarLabel(label, idx)}
                style={{
                  '--cfg-value': rowData[idx]
                }}
              ></i>
            </li>
          ))
        }
      </ol>
    </div>
  )

  // *******************

  function computeSpanByZero(minValue, maxValue) {
    return Math.max(
      Math.abs(minValue),
      Math.abs(maxValue),
      Math.abs(maxValue - minValue)
    )
  }
}
