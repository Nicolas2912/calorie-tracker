import { useMemo, useState } from 'react'
import { format, startOfDay, subDays } from 'date-fns'
import { Flame, Activity, Zap, ArrowDownCircle, ArrowUpCircle, CalendarRange } from 'lucide-react'
import './CalorieHistory.css'

const PRESET_RANGES = [7, 14, 30, 90]

function CalorieHistory({ entries, exercises }) {
  const [days, setDays] = useState(14)

  const { rows, averages, summary } = useMemo(() => {
    const endDate = startOfDay(new Date())
    const startDate = subDays(endDate, days - 1)

    const dayBuckets = new Map()

    for (let i = 0; i < days; i += 1) {
      const day = startOfDay(subDays(endDate, i))
      dayBuckets.set(day.getTime(), {
        date: day,
        intake: 0,
        burned: 0
      })
    }

    entries.forEach(entry => {
      const entryDate = startOfDay(new Date(entry.date))
      if (entryDate >= startDate && entryDate <= endDate) {
        const bucket = dayBuckets.get(entryDate.getTime())
        if (bucket) {
          bucket.intake += entry.calories
        }
      }
    })

    exercises.forEach(exercise => {
      const exerciseDate = startOfDay(new Date(exercise.date))
      if (exerciseDate >= startDate && exerciseDate <= endDate) {
        const bucket = dayBuckets.get(exerciseDate.getTime())
        if (bucket) {
          bucket.burned += exercise.caloriesBurned
        }
      }
    })

    const rows = Array.from(dayBuckets.values())
      .sort((a, b) => b.date - a.date)
      .map(day => ({
        ...day,
        net: day.intake - day.burned,
        status: day.intake - day.burned > 0 ? 'surplus' : day.intake - day.burned < 0 ? 'deficit' : 'balanced'
      }))

    const totals = rows.reduce((acc, day) => {
      acc.intake += day.intake
      acc.burned += day.burned
      acc.net += day.net
      if (day.net < acc.bestDeficit.net) acc.bestDeficit = day
      if (day.net > acc.bestSurplus.net) acc.bestSurplus = day
      if (day.net < 0) acc.deficitDays += 1
      if (day.net > 0) acc.surplusDays += 1
      return acc
    }, {
      intake: 0,
      burned: 0,
      net: 0,
      bestDeficit: { net: Number.POSITIVE_INFINITY },
      bestSurplus: { net: Number.NEGATIVE_INFINITY },
      deficitDays: 0,
      surplusDays: 0
    })

    const averages = {
      intake: rows.length > 0 ? totals.intake / rows.length : 0,
      burned: rows.length > 0 ? totals.burned / rows.length : 0,
      net: rows.length > 0 ? totals.net / rows.length : 0
    }

    const summary = {
      deficitDays: totals.deficitDays,
      surplusDays: totals.surplusDays,
      balancedDays: rows.length - totals.deficitDays - totals.surplusDays,
      bestDeficit: totals.bestDeficit.net === Number.POSITIVE_INFINITY ? null : totals.bestDeficit,
      bestSurplus: totals.bestSurplus.net === Number.NEGATIVE_INFINITY ? null : totals.bestSurplus
    }

    return { rows, averages, summary }
  }, [entries, exercises, days])

  return (
    <div className="calorie-history">
      <div className="history-header">
        <div>
          <h2>Calorie History</h2>
          <p className="subtitle">Compare intake versus burn across your recent activity</p>
        </div>
        <div className="range-selector">
          {PRESET_RANGES.map(range => (
            <button
              key={range}
              className={`range-btn ${range === days ? 'active' : ''}`}
              onClick={() => setDays(range)}
            >
              Last {range}d
            </button>
          ))}
        </div>
      </div>

      <div className="history-summary-grid">
        <div className="summary-card">
          <div className="summary-icon intake">
            <Flame size={28} />
          </div>
          <div className="summary-content">
            <span className="summary-label">Avg Intake</span>
            <span className="summary-value">{Math.round(averages.intake)} kcal</span>
            <span className="summary-meta">Across last {days} days</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon burned">
            <Activity size={28} />
          </div>
          <div className="summary-content">
            <span className="summary-label">Avg Burned</span>
            <span className="summary-value">{Math.round(averages.burned)} kcal</span>
            <span className="summary-meta">Exercise calories per day</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon net">
            <Zap size={28} />
          </div>
          <div className="summary-content">
            <span className="summary-label">Avg Net</span>
            <span className={`summary-value ${averages.net > 0 ? 'surplus' : averages.net < 0 ? 'deficit' : ''}`}>
              {averages.net > 0 ? '+' : ''}{Math.round(averages.net)} kcal
            </span>
            <span className="summary-meta">Intake minus burn</span>
          </div>
        </div>
      </div>

      <div className="summary-highlight">
        <div className="highlight-item">
          <CalendarRange size={20} />
          <span>
            {summary.deficitDays} deficit day{summary.deficitDays === 1 ? '' : 's'} · {summary.surplusDays} surplus day{summary.surplusDays === 1 ? '' : 's'} · {summary.balancedDays} balanced
          </span>
        </div>
        {summary.bestDeficit && (
          <div className="highlight-item">
            <ArrowDownCircle size={20} />
            <span>Strongest deficit {Math.abs(Math.round(summary.bestDeficit.net))} kcal on {format(summary.bestDeficit.date, 'MMM d')}</span>
          </div>
        )}
        {summary.bestSurplus && (
          <div className="highlight-item">
            <ArrowUpCircle size={20} />
            <span>Largest surplus +{Math.round(summary.bestSurplus.net)} kcal on {format(summary.bestSurplus.date, 'MMM d')}</span>
          </div>
        )}
      </div>

      <div className="history-table">
        <div className="history-table-header">
          <span>Date</span>
          <span>Calories In</span>
          <span>Calories Out</span>
          <span>Net</span>
          <span>Status</span>
        </div>
        <div className="history-table-body">
          {rows.map(day => (
            <div key={day.date.toISOString()} className="history-row">
              <span className="row-date">{format(day.date, 'EEE, MMM d')}</span>
              <span className="row-intake">{Math.round(day.intake)}</span>
              <span className="row-burned">{Math.round(day.burned)}</span>
              <span className={`row-net ${day.net > 0 ? 'surplus' : day.net < 0 ? 'deficit' : 'balanced'}`}>
                {day.net > 0 ? '+' : ''}{Math.round(day.net)}
              </span>
              <span className={`status-pill ${day.status}`}>
                {day.status === 'surplus' ? 'Surplus' : day.status === 'deficit' ? 'Deficit' : 'Balanced'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CalorieHistory
