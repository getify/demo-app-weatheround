export default ToggleControl


// *******************

function ToggleControl({
  name,
  currentValue,
  elementKey,
  description,
  onChangeCapture,
  option1: {
    title: option1Title,
    label: option1Label,
    value: option1Value,
    description: option1Description,
  },
  option2: {
    title: option2Title,
    label: option2Label,
    value: option2Value,
    description: option2Description,
  },
}) {
  return (
    <div
      className="toggleControl"
      key={elementKey}
      onChangeCapture={onChangeCapture}
      aria-description={description}
    >
      <label title={option1Title}>
        {option1Label}
        <input
          type="radio"
          name={name}
          value={option1Value}
          defaultChecked={currentValue === option1Value}
          aria-description={option1Description}
        />
      </label>

      <label title={option2Title}>
        <input
          type="radio"
          name={name}
          value={option2Value}
          defaultChecked={currentValue === option2Value}
          aria-description={option2Description}
        />
        {option2Label}
      </label>
    </div>
  )
}
