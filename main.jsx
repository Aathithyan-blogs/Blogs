import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Users, MapPin, Edit3, Save, X, Plus, Trash2, Moon, Sun, Download, Upload, Calendar, Filter } from 'lucide-react';

const InteractiveTimetable = () => {
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [filterInstructor, setFilterInstructor] = useState('');
  const [showStats, setShowStats] = useState(false);
  const editInputRef = useRef(null);

  const timeSlots = [
    '9.30-10.15', '10.15-11.00', '11.00-11.30', '11.30-12.15', 
    '12.15-1.00', '1.00-2.00', '2.00-3.00', '3.00-4.00', '4.00-5.00'
  ];

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const [scheduleData, setScheduleData] = useState({
    Mon: ['Bird Cage (Ujwal San)', '(Mira San) Creator', 'Break', 'Product Management (Kannan San)', '(Mejella San) CLUE', 'Lunch', 'Assignment Hour (Ujwal San)', 'Marketing (Vanitha San)', 'Phonetics (Ruby San)'],
    Tue: ['Weekly Newsletter Session (Ujwal San)', 'Product Management (Kannan San)', 'Break', '(Mejella San) CLUE', '(Mira San) Creator', 'Lunch', 'Creator Assignment - Mira San', 'Content Writing (Janani San)', 'Marketing (Vanitha San)'],
    Wed: ['Product Management Assignment (Kannan San)', 'Phonetics (Ruby San)', 'Break', '(Mejella San) CLUE', 'Content Writing (Janani San)', 'Lunch', 'Biz - Raj', '(Mira San) Product Learning', 'Marketing (Vanitha San)'],
    Thu: ['Content Writing (Janani San)', '(Mejella San) CLUE', 'Break', 'Assignment Hour (Ujwal)', 'Travelling Hour', 'Lunch', 'Larynx', '(Mira San) Creator', 'Open House/Guest Talk'],
    Fri: ['TED (Ujwal)', '(Mejella San) CLUE', 'Break', '(Mira San) Product Learning', 'Creator Assignment - Mira San', 'Lunch', 'Assignment Hour (Ujwal)', 'Podcast (Ujwal San)', 'Biz - Raj']
  });

  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingCell]);

  const getActivityColor = (activity) => {
    if (!activity || activity === '') return isDarkTheme ? 'bg-gray-800' : 'bg-gray-100';
    if (activity === 'Break') return isDarkTheme ? 'bg-yellow-600' : 'bg-yellow-200';
    if (activity === 'Lunch') return isDarkTheme ? 'bg-green-600' : 'bg-green-200';
    if (activity.includes('Ruby') || activity.includes('Phonetics')) return isDarkTheme ? 'bg-red-600' : 'bg-red-200';
    if (activity.includes('Janani') || activity.includes('Content Writing')) return isDarkTheme ? 'bg-blue-600' : 'bg-blue-200';
    if (activity.includes('Vanitha') || activity.includes('Marketing')) return isDarkTheme ? 'bg-purple-600' : 'bg-purple-200';
    if (activity.includes('Ujwal') || activity.includes('Assignment')) return isDarkTheme ? 'bg-orange-600' : 'bg-orange-200';
    if (activity.includes('English') || activity.includes('Creator')) return isDarkTheme ? 'bg-teal-600' : 'bg-teal-200';
    if (activity.includes('Product') || activity.includes('Management')) return isDarkTheme ? 'bg-indigo-600' : 'bg-indigo-200';
    return isDarkTheme ? 'bg-gray-700' : 'bg-gray-200';
  };

  const getTextColor = (activity) => {
    if (!activity || activity === '') return isDarkTheme ? 'text-gray-300' : 'text-gray-600';
    return isDarkTheme ? 'text-white' : 'text-gray-800';
  };

  const currentDayIndex = days.indexOf(selectedDay);

  const navigateDay = (direction) => {
    const currentIndex = days.indexOf(selectedDay);
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedDay(days[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < days.length - 1) {
      setSelectedDay(days[currentIndex + 1]);
    }
  };

  const startEditing = (dayIndex, timeIndex) => {
    const day = days[dayIndex];
    setEditingCell({ day, timeIndex });
    setEditValue(scheduleData[day][timeIndex] || '');
  };

  const saveEdit = () => {
    if (editingCell) {
      setScheduleData(prev => ({
        ...prev,
        [editingCell.day]: prev[editingCell.day].map((item, index) => 
          index === editingCell.timeIndex ? editValue : item
        )
      }));
      setEditingCell(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const addTimeSlot = () => {
    const newTime = prompt('Enter new time slot (e.g., 5.00-6.00):');
    if (newTime) {
      timeSlots.push(newTime);
      setScheduleData(prev => {
        const updated = {};
        Object.keys(prev).forEach(day => {
          updated[day] = [...prev[day], ''];
        });
        return updated;
      });
    }
  };

  const removeTimeSlot = (index) => {
    if (timeSlots.length > 1 && confirm('Are you sure you want to remove this time slot?')) {
      timeSlots.splice(index, 1);
      setScheduleData(prev => {
        const updated = {};
        Object.keys(prev).forEach(day => {
          updated[day] = prev[day].filter((_, i) => i !== index);
        });
        return updated;
      });
      if (selectedTimeSlot === index) setSelectedTimeSlot(null);
    }
  };

  const exportSchedule = () => {
    const dataStr = JSON.stringify({ timeSlots, scheduleData }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tharuvai_schedule.json';
    link.click();
  };

  const importSchedule = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.timeSlots && data.scheduleData) {
            timeSlots.splice(0, timeSlots.length, ...data.timeSlots);
            setScheduleData(data.scheduleData);
          }
        } catch (error) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const getInstructorStats = () => {
    const stats = {};
    Object.values(scheduleData).forEach(daySchedule => {
      daySchedule.forEach(activity => {
        if (activity && activity !== 'Break' && activity !== 'Lunch') {
          const match = activity.match(/\((.*?)\)/);
          const instructor = match ? match[1] : 'Unknown';
          stats[instructor] = (stats[instructor] || 0) + 1;
        }
      });
    });
    return stats;
  };

  const filteredSchedule = filterInstructor ? 
    scheduleData[selectedDay].map(activity => 
      activity.toLowerCase().includes(filterInstructor.toLowerCase()) ? activity : ''
    ) : scheduleData[selectedDay];

  const themeClasses = {
    bg: isDarkTheme ? 'bg-gray-900' : 'bg-white',
    cardBg: isDarkTheme ? 'bg-gray-800' : 'bg-white',
    text: isDarkTheme ? 'text-white' : 'text-gray-800',
    textSecondary: isDarkTheme ? 'text-gray-300' : 'text-gray-600',
    border: isDarkTheme ? 'border-gray-700' : 'border-gray-200',
    input: isDarkTheme ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300',
    button: isDarkTheme ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600',
    buttonSecondary: isDarkTheme ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} transition-all duration-300`}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header with Controls */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Interactive Timetable
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setIsDarkTheme(!isDarkTheme)}
                className={`p-3 rounded-full ${themeClasses.buttonSecondary} transition-all hover:scale-110`}
              >
                {isDarkTheme ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShowStats(!showStats)}
                className={`p-3 rounded-full ${themeClasses.buttonSecondary} transition-all hover:scale-110`}
              >
                <Calendar className="w-5 h-5" />
              </button>
              <button
                onClick={exportSchedule}
                className={`p-3 rounded-full ${themeClasses.button} text-white transition-all hover:scale-110`}
              >
                <Download className="w-5 h-5" />
              </button>
              <label className={`p-3 rounded-full ${themeClasses.button} text-white cursor-pointer transition-all hover:scale-110`}>
                <Upload className="w-5 h-5" />
                <input type="file" accept=".json" onChange={importSchedule} className="hidden" />
              </label>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 mb-4">
            <MapPin className="w-5 h-5 text-blue-400" />
            <span className={`text-lg ${themeClasses.textSecondary}`}>Tharuvai Schedule</span>
          </div>

          {/* Filter Controls */}
          <div className="flex justify-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <input
                type="text"
                placeholder="Filter by instructor..."
                value={filterInstructor}
                onChange={(e) => setFilterInstructor(e.target.value)}
                className={`px-3 py-2 rounded-lg ${themeClasses.input} transition-all focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        {showStats && (
          <div className={`mb-6 p-4 ${themeClasses.cardBg} rounded-xl border ${themeClasses.border} animate-in slide-in-from-top`}>
            <h3 className="text-lg font-semibold mb-3">Instructor Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(getInstructorStats()).map(([instructor, count]) => (
                <div key={instructor} className={`p-3 rounded-lg ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="font-medium">{instructor}</div>
                  <div className={`text-sm ${themeClasses.textSecondary}`}>{count} sessions</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Day Navigation */}
        <div className="flex items-center justify-center mb-8">
          <button
            onClick={() => navigateDay('prev')}
            disabled={currentDayIndex === 0}
            className={`p-3 rounded-full ${themeClasses.button} text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110 active:scale-95`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="mx-8 flex gap-2">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 ${
                  selectedDay === day
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : `${themeClasses.buttonSecondary} ${themeClasses.text}`
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <button
            onClick={() => navigateDay('next')}
            disabled={currentDayIndex === days.length - 1}
            className={`p-3 rounded-full ${themeClasses.button} text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110 active:scale-95`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Time Slots Header */}
        <div className="grid grid-cols-10 gap-3 mb-4">
          <div className={`font-bold text-center py-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl shadow-lg`}>
            <Clock className="w-5 h-5 mx-auto mb-1" />
            Time
          </div>
          {timeSlots.map((time, index) => (
            <div key={time} className="relative group">
              <button
                onClick={() => setSelectedTimeSlot(selectedTimeSlot === index ? null : index)}
                className={`w-full font-semibold text-center py-4 rounded-xl transition-all hover:scale-105 active:scale-95 ${
                  selectedTimeSlot === index
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : `${themeClasses.buttonSecondary} ${themeClasses.text}`
                }`}
              >
                <Clock className="w-4 h-4 mx-auto mb-1" />
                <div className="text-xs">{time}</div>
              </button>
              <button
                onClick={() => removeTimeSlot(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
              >
                <X className="w-3 h-3 mx-auto" />
              </button>
            </div>
          ))}
          <button
            onClick={addTimeSlot}
            className={`p-4 rounded-xl ${themeClasses.button} text-white transition-all hover:scale-105 active:scale-95`}
          >
            <Plus className="w-5 h-5 mx-auto" />
          </button>
        </div>

        {/* Schedule Grid */}
        <div className="grid grid-cols-10 gap-3 mb-8">
          <div className={`font-bold p-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl flex items-center justify-center shadow-lg`}>
            <Users className="w-5 h-5 mr-2" />
            Tharuvai
          </div>
          {filteredSchedule.map((activity, timeIndex) => (
            <div
              key={`tharuvai-${timeIndex}`}
              className={`relative p-4 rounded-xl transition-all cursor-pointer border-2 group hover:scale-105 active:scale-95 ${
                selectedTimeSlot === timeIndex
                  ? 'border-blue-400 shadow-lg shadow-blue-500/25 scale-105'
                  : `border-transparent hover:border-gray-400 ${isDarkTheme ? 'hover:border-gray-500' : 'hover:border-gray-400'}`
              } ${getActivityColor(activity)} ${getTextColor(activity)}`}
              onClick={() => setSelectedTimeSlot(selectedTimeSlot === timeIndex ? null : timeIndex)}
            >
              {editingCell && editingCell.day === selectedDay && editingCell.timeIndex === timeIndex ? (
                <div className="space-y-2">
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className={`w-full px-2 py-1 text-sm rounded ${themeClasses.input} focus:ring-2 focus:ring-blue-500`}
                    onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                    onKeyDown={(e) => e.key === 'Escape' && cancelEdit()}
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); saveEdit(); }}
                      className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      <Save className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                      className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-sm font-medium text-center min-h-[3rem] flex items-center justify-center">
                    {activity || 'Free'}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); startEditing(days.indexOf(selectedDay), timeIndex); }}
                    className="absolute top-2 right-2 p-1 bg-black/20 text-white rounded opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Selected Activity Details */}
        {selectedTimeSlot !== null && (
          <div className={`p-6 ${themeClasses.cardBg} rounded-2xl border ${themeClasses.border} shadow-2xl animate-in slide-in-from-bottom`}>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {timeSlots[selectedTimeSlot]} - {selectedDay}
            </h3>
            <div className={`${themeClasses.cardBg} p-6 rounded-xl border ${themeClasses.border} shadow-lg`}>
              <div className="font-semibold mb-3 flex items-center text-xl">
                <MapPin className="w-6 h-6 mr-3 text-blue-400" />
                Tharuvai Schedule
              </div>
              <div className={`p-6 rounded-xl text-center font-medium text-xl ${getActivityColor(scheduleData[selectedDay][selectedTimeSlot])} ${getTextColor(scheduleData[selectedDay][selectedTimeSlot])} shadow-inner`}>
                {scheduleData[selectedDay][selectedTimeSlot] || 'Free Period'}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Legend */}
        <div className={`mt-8 p-6 ${themeClasses.cardBg} rounded-2xl border ${themeClasses.border} shadow-lg`}>
          <h4 className="font-bold mb-4 text-xl">Color Legend & Quick Actions:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
            {[
              { color: 'bg-yellow-600', lightColor: 'bg-yellow-200', label: 'Break' },
              { color: 'bg-green-600', lightColor: 'bg-green-200', label: 'Lunch' },
              { color: 'bg-red-600', lightColor: 'bg-red-200', label: 'Ruby/Phonetics' },
              { color: 'bg-blue-600', lightColor: 'bg-blue-200', label: 'Janani/Content' },
              { color: 'bg-purple-600', lightColor: 'bg-purple-200', label: 'Vanitha/Marketing' },
              { color: 'bg-orange-600', lightColor: 'bg-orange-200', label: 'Ujwal/Assignments' },
              { color: 'bg-teal-600', lightColor: 'bg-teal-200', label: 'English/Creator' },
              { color: 'bg-indigo-600', lightColor: 'bg-indigo-200', label: 'Product Management' }
            ].map(({ color, lightColor, label }) => (
              <div key={label} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                <div className={`w-5 h-5 rounded-full ${isDarkTheme ? color : lightColor} shadow-sm`}></div>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className={`text-xs ${themeClasses.textSecondary} mt-4 p-3 rounded-lg ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <strong>Tips:</strong> Click any cell to select and view details • Hover over time slots to see delete option • 
            Double-click cells to edit • Use keyboard shortcuts: Enter to save, Escape to cancel • 
            Export/Import your schedule using the buttons in the header
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveTimetable;
