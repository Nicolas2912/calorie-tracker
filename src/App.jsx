import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import AddFood from './components/AddFood'
import Statistics from './components/Statistics'
import KFATracker from './components/KFATracker'
import Gamification from './components/Gamification'
import Nutrition from './components/Nutrition'
import History from './components/History'
import Settings from './components/Settings'
import Exercise from './components/Exercise'
import CalorieHistory from './components/CalorieHistory'
import { useLocalStorage } from './hooks/useLocalStorage'
import { GOAL_PRESETS, getPresetValues } from './constants/goalPresets'
import { Menu, TrendingUp, Plus, Award, Activity, Heart, Archive, Settings as SettingsIcon, Flame, BarChart3, Target, ChevronLeft, ChevronRight } from 'lucide-react'
import './App.css'

const DEFAULT_GOALS = {
  focus: 'custom',
  ...getPresetValues('custom')
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [entries, setEntries] = useLocalStorage('calorie-entries', [])
  const [foods, setFoods] = useLocalStorage('foods-database', [])
  const [kfaHistory, setKfaHistory] = useLocalStorage('kfa-history', [])
  const [exercises, setExercises] = useLocalStorage('exercise-history', [])
  const [goals, setGoals] = useLocalStorage('user-goals', DEFAULT_GOALS)
  const [achievements, setAchievements] = useLocalStorage('achievements', {
    streak: 0,
    totalEntries: 0,
    perfectDays: 0,
    level: 1
  })

  useEffect(() => {
    // Update achievements based on entries
    const today = new Date().toDateString()
    const todayEntries = entries.filter(e => new Date(e.date).toDateString() === today)

    if (todayEntries.length > 0) {
      setAchievements(prev => ({
        ...prev,
        totalEntries: entries.length
      }))
    }
  }, [entries])

  const addEntry = (entry) => {
    setEntries([...entries, { ...entry, id: Date.now() }])
  }

  const deleteEntry = (entryId) => {
    setEntries(entries.filter(e => e.id !== entryId))
  }

  const addFood = (food) => {
    const existingFood = foods.find(f =>
      f.name.toLowerCase() === food.name.toLowerCase()
    )
    if (!existingFood) {
      setFoods([...foods, { ...food, id: Date.now(), usageCount: 1 }])
    } else {
      setFoods(foods.map(f =>
        f.id === existingFood.id
          ? { ...f, usageCount: (f.usageCount || 0) + 1 }
          : f
      ))
    }
  }

  const addKFA = (kfaEntry) => {
    setKfaHistory([...kfaHistory, { ...kfaEntry, id: Date.now() }])
  }

  const deleteKFA = (kfaId) => {
    setKfaHistory(kfaHistory.filter(k => k.id !== kfaId))
  }

  const deleteFood = (foodId) => {
    setFoods(foods.filter(f => f.id !== foodId))
  }

  const updateFood = (foodId, updatedFood) => {
    setFoods(foods.map(f =>
      f.id === foodId ? { ...f, ...updatedFood } : f
    ))
  }

  const addExercise = (exercise) => {
    setExercises([...exercises, { ...exercise, id: Date.now() }])
  }

  const deleteExercise = (exerciseId) => {
    setExercises(exercises.filter(e => e.id !== exerciseId))
  }

  const clearAllData = () => {
    setEntries([])
    setFoods([])
    setKfaHistory([])
    setExercises([])
    setGoals({ ...DEFAULT_GOALS })
    setAchievements({
      streak: 0,
      totalEntries: 0,
      perfectDays: 0,
      level: 1
    })
  }

  const menuGroups = [
    {
      label: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Activity }
      ]
    },
    {
      label: 'Tracking',
      items: [
        { id: 'add', label: 'Add Food', icon: Plus },
        { id: 'exercise', label: 'Exercise', icon: Flame },
        { id: 'history', label: 'History', icon: Archive }
      ]
    },
    {
      label: 'Analytics',
      items: [
        { id: 'nutrition', label: 'Nutrition', icon: Heart },
        { id: 'statistics', label: 'Statistics', icon: BarChart3 },
        { id: 'calorie-history', label: 'Calorie History', icon: TrendingUp },
        { id: 'kfa', label: 'Body Comp', icon: Target }
      ]
    },
    {
      label: 'Progress',
      items: [
        { id: 'achievements', label: 'Achievements', icon: Award }
      ]
    },
    {
      label: 'Settings',
      items: [
        { id: 'settings', label: 'Settings', icon: SettingsIcon }
      ]
    }
  ]

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-brand">
            <Menu size={28} />
            <h1>Calorie Tracker</h1>
          </div>
        </div>
      </header>

      <div className="app-layout">
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          <nav className="sidebar-nav">
            {menuGroups.map(group => (
              <div key={group.label} className="nav-group">
                {!sidebarCollapsed && (
                  <div className="nav-group-label">{group.label}</div>
                )}
                <div className="nav-items">
                  {group.items.map(item => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                        title={sidebarCollapsed ? item.label : ''}
                      >
                        <Icon size={20} />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <main className="main-content">
          {activeTab === 'dashboard' && (
            <Dashboard
              entries={entries}
              exercises={exercises}
              achievements={achievements}
              goals={goals}
              updateGoals={setGoals}
              deleteEntry={deleteEntry}
            />
          )}
          {activeTab === 'add' && (
            <AddFood
              addEntry={addEntry}
              addFood={addFood}
              foods={foods}
              deleteFood={deleteFood}
              updateFood={updateFood}
            />
          )}
          {activeTab === 'exercise' && (
            <Exercise exercises={exercises} addExercise={addExercise} deleteExercise={deleteExercise} />
          )}
          {activeTab === 'history' && (
            <History entries={entries} deleteEntry={deleteEntry} />
          )}
          {activeTab === 'nutrition' && (
            <Nutrition entries={entries} />
          )}
          {activeTab === 'statistics' && (
            <Statistics entries={entries} />
          )}
          {activeTab === 'calorie-history' && (
            <CalorieHistory entries={entries} exercises={exercises} />
          )}
          {activeTab === 'kfa' && (
            <KFATracker kfaHistory={kfaHistory} addKFA={addKFA} deleteKFA={deleteKFA} />
          )}
          {activeTab === 'achievements' && (
            <Gamification
              achievements={achievements}
              entries={entries}
              kfaHistory={kfaHistory}
            />
          )}
          {activeTab === 'settings' && (
            <Settings
              clearAllData={clearAllData}
              goals={goals}
              updateGoals={setGoals}
              defaultGoals={DEFAULT_GOALS}
              entries={entries}
              foods={foods}
              kfaHistory={kfaHistory}
              exercises={exercises}
              achievements={achievements}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
