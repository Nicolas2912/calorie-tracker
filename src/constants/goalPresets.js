export const GOAL_PRESETS = {
  custom: {
    label: 'Custom',
    description: 'Set your own targets manually.',
    values: {
      calorieTarget: 2000,
      proteinTarget: 150,
      netTarget: -500
    }
  },
  muscle_gain: {
    label: 'Muscle Gain',
    description: 'Support hypertrophy with a surplus and higher protein intake.',
    values: {
      calorieTarget: 2800,
      proteinTarget: 180,
      netTarget: 250
    }
  },
  fat_loss: {
    label: 'Fat Loss',
    description: 'Moderate deficit with elevated protein to maintain lean mass.',
    values: {
      calorieTarget: 1900,
      proteinTarget: 170,
      netTarget: -500
    }
  },
  maintenance: {
    label: 'Maintenance',
    description: 'Keep calories and net balance level for recomposition phases.',
    values: {
      calorieTarget: 2300,
      proteinTarget: 160,
      netTarget: 0
    }
  }
}

export const getPresetValues = (focus) => {
  const preset = GOAL_PRESETS[focus]
  return preset ? { ...preset.values } : { ...GOAL_PRESETS.custom.values }
}

export const GOAL_OPTIONS = Object.entries(GOAL_PRESETS).map(([key, preset]) => ({
  value: key,
  label: preset.label,
  description: preset.description
}))
