import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  StatusBar, 
  SafeAreaView,
  Dimensions,
  Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Time slots (9am-6pm)
const TIME_SLOTS = [
  '9:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '12:00-13:00',
  '13:00-14:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
  '17:00-18:00'
];

// Faculty Data
const FACULTY_MAPS = {
  etc: {
    PS: 'Prof. A Deshpande',
    EMT: 'Prof. Prashant Mahajan',
    EC: 'Prof. Nikhil Kapse',
    SNTW: 'Prof. Anil Patil',
    VE: 'Vocational elective (2 hrs)',
    ST: 'Prof. Shweta Thombare',
    SS: 'Prof. Prashant Mahajan',
    EC_LAB: 'Prof. Nikhil Kapse (2 hrs)',
    SP_LAB: 'Prof. Pankaj Pandya (2 hrs)',
  },
  vlsidt: {
    PS: 'Prof. Srikumar Acharya',
    ADE: 'Prof. V K Jha',
    MF: 'Prof. U P Singh',
    CDSA: 'Prof. Amit Kumar V. Jha',
    SS: 'Prof. Sananda Kumar',
    EC_LAB: 'Prof. S K Mahapatra, Prof. V K Jha (2 hrs)',
    DS_LAB: 'Prof. B P De, Prof. B S Patro (2 hrs)',
    SNTW: 'Prof. Amlana Panda',
    VE: 'Vocational elective (2 hrs)',
  },
  ecse: {
    'Group-1': {
      PS: 'Prof. Sushma Singh',
      SS: 'Prof. Ansuman Pattanaik',
      EC: 'Prof. Anupama Senapati',
      DS: 'Prof. Manoranjan Kumar',
      CSA: 'Prof. Srinibas Padhy',
      DS_LAB: 'Prof. M Kumar, Prof. B S Patra (2 hrs)',
      SP_LAB: 'Prof. A Pattanaik, Prof. U C Samal (2 hrs)',
      SNTW: 'Prof. Chitralekha Jena',
      VE: 'Vocational elective (2 hrs)',
    },
    'Group-2': {
      PS: 'Prof. Sushma Singh',
      SS: 'Prof. Tejaswini Kar',
      EC: 'Prof. Sandeep Kumar Dash',
      DS: 'Prof. Bishnu Prasad De',
      CSA: 'Prof. Pradipta Dutta',
      DS_LAB: 'Prof. B P De, Prof. M Kumar (2 hrs)',
      SP_LAB: 'Prof. S Kumar, Prof. U C Samal (2 hrs)',
      SNTW: 'Prof. Gitanjali Dei',
      VE: 'Vocational elective (2 hrs)',
    },
    'Group-3': {
      PS: 'Prof. Sushma Singh',
      SS: 'Prof. Tejaswini Kar',
      EC: 'Prof. Vikas Kumar Jha',
      DS: 'Prof. Manoranjan Kumar',
      CSA: 'Prof. Kumar Biswal',
      DS_LAB: 'Prof. M Kumar, Prof. A K V Jha (2 hrs)',
      SP_LAB: 'Prof. S Kumar, Prof. A Pattanaik (2 hrs)',
      SNTW: 'Prof. Rudra Narayan Senapati',
      VE: 'Vocational elective (2 hrs)',
    },
    'Group-4': {
      PS: 'Prof. Manoranjan Sahoo',
      SS: 'Prof. Umesh Chandra Samal',
      EC: 'Prof. Manjusha Behera',
      DS: 'Prof. Bishnu Prasad De',
      CSA: 'Prof. Kumar Biswal',
      DS_LAB: 'Prof. B P De, Prof. B S Patro (2 hrs)',
      SP_LAB: 'Prof. T Kar, Prof. U C Samal (2 hrs)',
      SNTW: 'Prof. Samita Pani',
      VE: 'Vocational elective (2 hrs)',
    },
  },
  ee: {
    EC_LAB: 'Prof. S K Mahapatra & Prof. V K Jha (2 hrs)',
    SS: 'Prof. Sananda Kumar',
    CDSA: 'Prof. Amit Kumar V. Jha',
    SNTW: 'Prof. Amlana Panda',
    PS: 'Prof. Srikumar Acharya',
    EC: 'Prof. V K Jha',
    NT: 'Prof. Network Theory Faculty',
    VE: 'Vocational elective (2 hrs)',
    DS_LAB: 'Prof. B P De & Prof. B S Patro (2 hrs)',
    'PS (CL-06)': 'Prof. Srikumar Acharya (CL-06)',
    'NT (CL-06)': 'Prof. Network Theory Faculty (CL-06)'
  }
};

// Timetable Data  (omitted for brevity - KEEP ALL YOUR DATA FROM ORIGINAL)
const TIMETABLE_DATA = {
  // ... keep YOUR timetable data here (unchanged) ...
  etc: {
    'Group-1': {
      Monday:    ['PS', 'EMT', 'EC', 'SS', 'SNTW', 'X', 'X', 'X', 'X'],
      Tuesday:   ['X', 'PS', 'EC', 'ST', 'X', 'X', 'EC LAB', 'EC LAB', 'X', 'X'],
      Wednesday: ['X', 'EC', 'SS', 'SP_LAB', 'SP_LAB', 'X', 'PS', 'ST', 'X', 'X'],
      Thursday:  ['PS', 'SS', 'EC', 'EMT', 'X', 'X', 'VE', 'VE', 'X', 'X'],
      Friday:    ['EC LAB', 'EC LAB', 'SNTW', 'ST', 'EMT', 'X', 'VE', 'VE', 'X', 'X', 'X']
    },
    'Group-2': {
      Monday:    ['EMT', 'EC', 'ST', 'PS', 'X', 'X', 'SP_LAB', 'SP_LAB', 'X', 'X'],
      Tuesday:   ['EC LAB', 'EC LAB', 'EC', 'SS', 'X', 'X', 'X', 'X', 'X', 'X'],
      Wednesday: ['PS', 'EC', 'SS', 'ST', 'SNTW', 'X', 'X', 'X', 'X'],
      Thursday:  ['EMT', 'EC', 'ST', 'SS', 'PS', 'X', 'VE', 'VE', 'X', 'X'],
      Friday:    ['PS', 'EMT', 'SNTW', 'EC LAB', 'EC LAB', 'X', 'VE', 'VE', 'X', 'X', 'X']
    },
    'Group-3': {
      Monday:    ['PS', 'ST', 'EMT', 'EC', 'X', 'X', 'EC LAB', 'EC LAB', 'X', 'X'],
      Tuesday:   ['SP_LAB', 'SP_LAB', 'ST', 'EC', 'SS', 'X', 'X', 'X', 'X', 'X'],
      Wednesday: ['X', 'ST', 'SS', 'EC LAB', 'EC LAB', 'X', 'PS', 'EMT', 'X', 'X'],
      Thursday:  ['PS', 'SNTW', 'SS', 'EC', 'X', 'X', 'VE', 'VE', 'X', 'X'],
      Friday:    ['EMT', 'EC', 'PS', 'SNTW', 'X', 'X', 'VE', 'VE', 'X', 'X']
    }
  },
  vlsidt: {
    default: {
      Monday:    ['EC LAB', 'EC LAB', 'SS', 'ADE', 'X', 'X', 'SNTW', 'PS', 'X', 'X'],
      Tuesday:   ['ADE', 'CDSA', 'SS', 'PS', 'X', 'X', 'X', 'X', 'X', 'X'],
      Wednesday: ['SS', 'CDSA', 'MF', 'PS', 'X', 'X', 'EC LAB', 'EC LAB', 'X', 'X'],
      Thursday:  ['CDSA', 'MF', 'ADE', 'SNTW', 'X', 'X', 'VE', 'VE', 'X', 'X'],
      Friday:    ['PS', 'ADE', 'MF', 'DS LAB', 'DS LAB', 'X', 'VE', 'VE', 'X', 'X', 'X']
    }
  },
  ecse: {
    'Group-1': {
      Monday:    ['PS', 'SS', 'EC', 'CSA', 'X', 'X', 'DS', 'SNTW', 'X', 'X'],
      Tuesday:   ['PS', 'EC', 'DS', 'DS LAB', 'DS LAB', 'X', 'X', 'X', 'X', 'X'],
      Wednesday: ['DS', 'PS', 'EC', 'SS', 'X', 'X', 'X', 'X', 'X', 'X'],
      Thursday:  ['SP_LAB', 'SP_LAB', 'EC', 'CSA', 'X', 'X', 'VE', 'VE', 'X', 'X'],
      Friday:    ['DS', 'CSA', 'SS', 'SNTW', 'PS', 'X', 'VE', 'VE', 'X', 'X']
    },
    'Group-2': {
      Monday:    ['DS LAB', 'DS LAB', 'EC', 'PS', 'X', 'X', 'CSA', 'DS', 'X', 'X'],
      Tuesday:   ['CSA', 'PS', 'SS', 'DS', 'X', 'X', 'X', 'X', 'X', 'X'],
      Wednesday: ['CSA', 'SS', 'DS', 'EC', 'X', 'X', 'X', 'X', 'X', 'X'],
      Thursday:  ['SNTW', 'SS', 'PS', 'EC', 'X', 'X', 'VE', 'VE', 'X', 'X'],
      Friday:    ['PS', 'EC', 'DS', 'SNTW', 'X', 'X', 'VE', 'VE', 'X', 'X']
    },
    'Group-3': {
      Monday:    ['CSA', 'PS', 'DS LAB', 'DS LAB', 'X', 'X', 'X', 'X', 'X', 'X'],
      Tuesday:   ['DS', 'SS', 'SNTW', 'EC', 'PS', 'X', 'X', 'X', 'X', 'X'],
      Wednesday: ['DS', 'EC', 'SS', 'PS', 'X', 'X', 'X', 'X', 'X', 'X'],
      Thursday:  ['CSA', 'DS', 'SNTW', 'EC', 'X', 'X', 'VE', 'VE', 'X', 'X'],
      Friday:    ['PS', 'CSA', 'DS', 'EC', 'SS', 'X', 'VE', 'VE', 'X', 'X']
    },
    'Group-4': {
      Monday:    ['EC', 'SS', 'PS', 'SNTW', 'X', 'X', 'X', 'X', 'X', 'X'],
      Tuesday:   ['SS', 'PS', 'DS', 'EC', 'CSA', 'X', 'X', 'X', 'X', 'X'],
      Wednesday: ['DS LAB', 'DS LAB', 'SS', 'SNTW', 'DS', 'X', 'X', 'X', 'X', 'X'],
      Thursday:  ['PS', 'CSA', 'DS', 'SP_LAB', 'SP_LAB', 'X', 'VE', 'VE', 'X', 'X'],
      Friday:    ['CSA', 'DS', 'EC', 'PS', 'X', 'X', 'VE', 'VE', 'X', 'X']
    }
  },
  ee: {
    default: {
      Monday:    ['EC LAB', 'EC LAB', 'SS', 'PS', 'X', 'X', 'X', 'X', 'X'],
      Tuesday:   ['CDSA', 'SS', 'EC', 'EC', 'PS (CL-06)', 'NT (CL-06)', 'X', 'X', 'X'],
      Wednesday: ['SS', 'CDSA', 'EC', 'NT', 'X', 'EC LAB', 'EC LAB', 'X', 'X'],
      Thursday:  ['CDSA', 'PS', 'SNTW', 'EC', 'X', 'VE', 'VE', 'X', 'X'],
      Friday:    ['PS', 'NT', 'SNTW', 'DS LAB', 'DS LAB', 'X', 'VE', 'VE', 'X']
    }
  }
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SUBJECT_COLORS = ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F', '#EDC948', '#B07AA1', '#FF9DA7'];
const BRANCH_OPTIONS = [
  { label: 'E&TC', value: 'etc' },
  { label: 'VLSI Design & Tech', value: 'vlsidt' },
  { label: 'ECSE', value: 'ecse' },
  { label: 'E&E', value: 'ee' },
];

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [currentDay, setCurrentDay] = useState('Monday');
  const [availableGroups, setAvailableGroups] = useState([]);

  // Always define this function so you can call it from anywhere
  const savePreferences = useCallback(async (branch = selectedBranch, group = selectedGroup, dark = isDark) => {
    try {
      const preferences = {
        branch,
        group,
        darkMode: dark
      };
      await AsyncStorage.setItem('timetablePreferences', JSON.stringify(preferences));
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences');
      console.error('Error saving preferences:', error);
    }
  }, [selectedBranch, selectedGroup, isDark]);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedPreferences = await AsyncStorage.getItem('timetablePreferences');
        if (savedPreferences) {
          const { branch, group, darkMode } = JSON.parse(savedPreferences);
          setSelectedBranch(branch);
          setSelectedGroup(group);
          setIsDark(darkMode || false);
        }
        const today = new Date().getDay();
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        setCurrentDay(dayNames[today]);
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };
    loadPreferences();
  }, []);

  // Always save preferences when any of these changes
  useEffect(() => {
    savePreferences();
  }, [selectedBranch, selectedGroup, isDark, savePreferences]);

  // Handle group & availableGroups when branch changes (and always save new prefs!)
  useEffect(() => {
    let reset = false;
    if (selectedBranch === 'etc') {
      setAvailableGroups(['Group-1', 'Group-2', 'Group-3']);
      if (!['Group-1', 'Group-2', 'Group-3'].includes(selectedGroup)) {
        setSelectedGroup('');
        reset = true;
      }
    } else if (selectedBranch === 'ecse') {
      setAvailableGroups(['Group-1', 'Group-2', 'Group-3', 'Group-4']);
      if (!['Group-1', 'Group-2', 'Group-3', 'Group-4'].includes(selectedGroup)) {
        setSelectedGroup('');
        reset = true;
      }
    } else if (selectedBranch) {
      setAvailableGroups([]);
      if (selectedGroup !== 'default') {
        setSelectedGroup('default');
        reset = true;
      }
    } else {
      setAvailableGroups([]);
      if (selectedGroup !== '') {
        setSelectedGroup('');
        reset = true;
      }
    }
    // Save preferences IF group was programmatically changed!
    if (reset) {
      setTimeout(() => savePreferences(), 100); // Defer to after setState
    }
    // eslint-disable-next-line
  }, [selectedBranch]);

  const handleEmailPress = () => {
    const email = '2430031@kiit.ac.in';
    const subject = 'E-Time App Feedback';
    const body = 'Dear Support Team,\n\nI would like to report the following issue:\n\n';
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const getSubjectColor = (subject) => {
    if (subject === 'X') return isDark ? '#374151' : '#e5e7eb';
    const hash = subject.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
  };

  const getFaculty = (subject) => {
    if (!selectedBranch || subject === 'X') return '';
    if (selectedBranch === 'ee' && (subject === 'PS (CL-06)' || subject === 'NT (CL-06)')) {
      return FACULTY_MAPS.ee[subject];
    }
    const facultyMap = FACULTY_MAPS[selectedBranch];
    if (selectedBranch === 'ecse' && selectedGroup && selectedGroup !== 'default') {
      return facultyMap[selectedGroup]?.[subject] || '';
    }
    return facultyMap[subject] || '';
  };

  const getCurrentTimetable = () => {
    if (!selectedBranch) return null;
    const branchData = TIMETABLE_DATA[selectedBranch];
    if (!branchData) return null;
    const groupKey = selectedGroup || 'default';
    return branchData[groupKey] || null;
  };

  const findLastClassIndex = (schedule) => {
    for (let i = schedule.length - 1; i >= 0; i--) {
      if (schedule[i] !== 'X') {
        return i;
      }
    }
    return -1;
  };

  const handleSavePreferences = async () => {
    await savePreferences();
    Alert.alert('Success', 'Preferences saved successfully!');
  };

  const handleClearPreferences = async () => {
    try {
      await AsyncStorage.removeItem('timetablePreferences');
      setSelectedBranch('');
      setSelectedGroup('');
      setIsDark(false);
      Alert.alert('Success', 'Preferences cleared!');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear preferences');
      console.error('Error clearing preferences:', error);
    }
  };
  
  const renderTimetable = () => {
    const timetable = getCurrentTimetable();
    if (!timetable) {
      return (
        <View style={[styles.emptyState, isDark && styles.darkEmptyState]}>
          <Text style={[styles.emptyTitle, isDark && styles.darkTealText]}>📚 Welcome to E-Time</Text>
          <Text style={[styles.emptySubtitle, isDark && styles.darkSecondaryText]}>
            Your digital electronics timetable companion
          </Text>
          <Text style={[styles.emptySubtitle, isDark && styles.darkSecondaryText]}>
            Select your branch above to get started
          </Text>
        </View>
      );
    }
    
    

    const daySchedule = timetable[currentDay];
    if (!daySchedule) {
      return (
        <View style={[styles.emptyState, isDark && styles.darkEmptyState]}>
          <Text style={styles.weekendEmoji}>🎉</Text>
          <Text style={[styles.weekendTitle, isDark && styles.darkTealText]}>It's the weekend!</Text>
          <Text style={[styles.emptySubtitle, isDark && styles.darkSecondaryText]}>No classes scheduled today</Text>
        </View>
      );
    }

    const lastClassIndex = findLastClassIndex(daySchedule);
    const trimmedSchedule = daySchedule.slice(0, lastClassIndex + 1);
    const trimmedTimeSlots = TIME_SLOTS.slice(0, lastClassIndex + 1);

    if (lastClassIndex === -1) {
      return (
        <View style={[styles.emptyState, isDark && styles.darkEmptyState]}>
          <Text style={styles.weekendEmoji}>📚</Text>
          <Text style={[styles.emptyTitle, isDark && styles.darkTealText]}>No Classes Today</Text>
          <Text style={[styles.emptySubtitle, isDark && styles.darkSecondaryText]}>Enjoy your free day!</Text>
        </View>
      );
    }

    const processedRows = [];
    let skipNext = false;

    for (let index = 0; index < trimmedSchedule.length; index++) {
      if (skipNext) {
        skipNext = false;
        continue;
      }

      const subject = trimmedSchedule[index];
      const nextSubject = index + 1 < trimmedSchedule.length ? trimmedSchedule[index + 1] : null;
      const isBreak = subject === 'X';
      const faculty = getFaculty(subject);
      const subjectColor = getSubjectColor(subject);

      const is2HourClass = !isBreak && subject === nextSubject && 
                          (subject.endsWith('_LAB') || subject === 'VE');

      let timeSlot = trimmedTimeSlots[index];
      if (is2HourClass) {
        const startTime = trimmedTimeSlots[index].split('-')[0];
        const endTime = trimmedTimeSlots[index + 1].split('-')[1];
        timeSlot = `${startTime}-${endTime}`;
        skipNext = true;
      }

      processedRows.push({
        timeSlot,
        subject,
        isBreak,
        faculty,
        subjectColor,
        is2HourClass,
        venue: subject.includes('(') ? subject.match(/\((.*?)\)/)[1] : null
      });
    }

    return (
      <View style={[styles.timetableContainer, isDark && styles.darkCard]}>
        <View style={styles.timetableHeader}>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Time</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Subject</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Faculty</Text>
          </View>
        </View>
        {processedRows.map((row, index) => (
          <View
            key={index}
            style={[
              styles.timetableRow,
              isDark
                ? index % 2 === 0
                  ? styles.darkEvenRow
                  : styles.darkOddRow
                : index % 2 === 0
                  ? styles.evenRow
                  : styles.oddRow,
              isDark && styles.darkRow,
              row.isBreak && (isDark ? styles.darkBreakRow : styles.breakRow),
              row.is2HourClass && styles.twoHourRow,
              isDark && row.is2HourClass && styles.darkTwoHourRow,
            ]}
          >
            <View style={styles.timeCell}>
              <Text
                style={[
                  styles.timeText,
                  isDark && styles.darkSecondaryText,
                  row.is2HourClass && styles.twoHourTimeText,
                  isDark && row.is2HourClass && styles.darkTwoHourTimeText,
                ]}
              >
                {row.timeSlot}
              </Text>
            </View>

            <View style={styles.subjectCell}>
              {row.isBreak ? (
                <Text style={[styles.breakText, isDark && styles.darkSecondaryText]}>☕ Break</Text>
              ) : (
                <View style={styles.subjectContent}>
                  <View style={[styles.subjectBadge, { backgroundColor: row.subjectColor }]}>
                    <Text style={styles.subjectBadgeText}>
                      {row.subject.includes('(') ? row.subject.split(' ')[0].charAt(0) : row.subject.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.subjectInfo}>
                    <Text style={[styles.subjectText, isDark && styles.darkText]}>
                      {row.subject.includes('(') ? row.subject.split(' (')[0] : row.subject}
                    </Text>
                    {row.venue && (
                      <Text style={[styles.venueText, isDark && styles.darkSecondaryText]}>
                        {row.venue}
                      </Text>
                    )}
                    {row.is2HourClass && (
                      <Text style={[styles.durationText, isDark && styles.darkSecondaryText]}>2 hours</Text>
                    )}
                  </View>
                </View>
              )}
            </View>

            <View style={styles.facultyCell}>
              {!row.isBreak && (
                <Text style={[styles.facultyText, isDark && styles.darkSecondaryText]}>
                  {row.faculty}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Modern Header */}
      <View style={[styles.header, isDark && styles.darkHeader]}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>E-Time</Text>
            <Text style={[styles.subtitle, isDark && styles.darkSubtitle]}>
              Your Digital Timetable Companion
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.themeButton, isDark && styles.darkThemeButton]}
            onPress={() => setIsDark(!isDark)}
          >
            <Text style={styles.themeButtonText}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Controls */}
        {/* Day Navigation */}
        <View style={[styles.dayNavigation, isDark && styles.darkCard]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.dayTabs}>
              {DAYS.map((day) => {
                const isActive = currentDay === day;
                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayTab,
                      isActive && styles.activeDayTab,
                      isDark && styles.darkDayTab,
                      isActive && isDark && styles.darkActiveDayTab, // Use dark teal highlight
                    ]}
                    onPress={() => setCurrentDay(day)}
                  >
                    <Text
                      style={[
                        styles.dayTabText,
                        isActive && styles.activeDayTabText,
                        isDark && styles.darkText,
                        isActive && { color: 'white' },
                      ]}
                    >
                      {day.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
                {/* Timetable */}
        {selectedBranch && (
          <View style={styles.timetableSection}>
            <Text style={[styles.timetableTitle, isDark && styles.darkTealText]}>
              {currentDay} Timetable
            </Text>
            {renderTimetable()}
          </View>
        )}
        <View style={[styles.controlsCard, isDark && styles.darkCard]}>
          <View style={styles.controlRow}>
            <Text style={[styles.label, isDark && styles.darkText]}>SELECT BRANCH</Text>
            <View style={styles.buttonGrid}>
              {BRANCH_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    selectedBranch === option.value && styles.selectedOption,
                    isDark && styles.darkOptionButton,
                    selectedBranch === option.value && isDark && styles.darkSelectedOption
                  ]}
                  onPress={() => setSelectedBranch(option.value)}
                >
                  <Text style={[
                    styles.optionText,
                    selectedBranch === option.value && styles.selectedOptionText,
                    isDark && !(selectedBranch === option.value) && styles.darkOptionText
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {availableGroups.length > 0 && (
            <View style={styles.controlRow}>
              <Text style={[styles.label, isDark && styles.darkText]}>SELECT GROUP</Text>
              <View style={styles.buttonGrid}>
                {availableGroups.map((group) => (
                  <TouchableOpacity
                    key={group}
                    style={[
                      styles.optionButton,
                      selectedGroup === group && styles.selectedOption,
                      isDark && styles.darkOptionButton,
                      selectedGroup === group && isDark && styles.darkSelectedOption
                    ]}
                    onPress={() => setSelectedGroup(group)}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedGroup === group && styles.selectedOptionText,
                      isDark && !(selectedGroup === group) && styles.darkOptionText
                    ]}>
                      {group}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSavePreferences}
            >
              <Text style={styles.primaryButtonText}>Save Preferences</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, isDark && styles.darkSecondaryButton]}
              onPress={handleClearPreferences}
            >
              <Text style={[styles.secondaryButtonText, isDark && styles.darkText]}>
                Clear Preferences
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        


      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, isDark && styles.darkFooter]}>
        <Text style={[styles.footerText, isDark && styles.darkSecondaryText]}>
          © {new Date().getFullYear()} E-Time Timetable App | Designed for Electronics Students
        </Text>
        <TouchableOpacity onPress={handleEmailPress}>
          <Text style={[styles.contactText, isDark && styles.darkContactText]}>
            Having problems? Contact 2430031@kiit.ac.in
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ==== STYLES ====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  darkContainer: {
    backgroundColor: '#111827',
  },
  header: {
    backgroundColor: '#14b8a6',
    paddingVertical: 18,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  darkHeader: {
    backgroundColor: '#0f766e',
    shadowColor: '#000',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    maxWidth: width * 0.7,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'System',
    fontWeight: '500',
  },
  darkSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  themeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  darkThemeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  themeButtonText: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    padding: 24,
  },
    controlsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: '#1f2937',
  },
  controlRow: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  darkText: {
    color: '#f3f4f6',
  },
  darkSecondaryText: {
    color: '#9ca3af',
  },
  darkTealText: {
    color: '#5eead4',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#14b8a6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  darkSecondaryButton: {
    borderColor: '#4b5563',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  dayNavigation: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayTabs: {
    flexDirection: 'row',
    gap: 0,
  },
  dayTab: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  darkDayTab: {
    backgroundColor: 'transparent',
  },
  activeDayTab: {
    backgroundColor: '#14b8a6',
  },
  darkActiveDayTab: {
    backgroundColor: '#0f766e',
  },
  dayTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeDayTabText: {
    color: 'white',
  },
  timetableSection: {
    marginBottom: 24,
  },
  timetableTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14b8a6',
    marginBottom: 16,
    textAlign: 'center',
  },
  timetableContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timetableHeader: {
    flexDirection: 'row',
    backgroundColor: '#14b8a6',
  },
  headerCell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timetableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  evenRow: {
    backgroundColor: '#ffffff',
  },
  oddRow: {
    backgroundColor: '#f9fafb',
  },
  darkEvenRow: {
    backgroundColor: '#1f2937',
  },
  darkOddRow: {
    backgroundColor: '#111827',
  },
  darkRow: {
    borderBottomColor: '#374151',
  },
  darkBreakRow: {
    backgroundColor: 'rgba(124, 45, 18, 0.2)',
  },
  timeCell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  subjectCell: {
    flex: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  subjectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subjectBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  subjectInfo: {
    flex: 1,
  },
  subjectText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  venueText: {
    fontSize: 10,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 2,
  },
  breakText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#6b7280',
  },
  facultyCell: {
    flex: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  facultyText: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkEmptyState: {
    backgroundColor: '#1f2937',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#14b8a6',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  weekendEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  weekendTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: 'white',
  },
  darkOptionButton: {
    backgroundColor: '#1f2937',
    borderColor: '#4b5563',
  },
  selectedOption: {
    backgroundColor: '#14b8a6',
    borderColor: '#14b8a6',
  },
  darkSelectedOption: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },
  optionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  darkOptionText: {
    color: '#f3f4f6',
  },
  selectedOptionText: {
    color: 'white',
  },
  twoHourRow: {
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
  },
  darkTwoHourRow: {
    backgroundColor: 'rgba(20, 184, 166, 0.2)',
  },
  twoHourTimeText: {
    fontWeight: 'bold',
  },
  darkTwoHourTimeText: {
    color: '#5eead4',
  },
  durationText: {
    fontSize: 10,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 2,
  },
  breakRow: {
    backgroundColor: 'rgba(249, 168, 37, 0.1)',
  },
  footer: {
    padding: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  darkFooter: {
    backgroundColor: '#111827',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  contactText: {
    fontSize: 12,
    color: '#14b8a6',
    textAlign: 'center',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  darkContactText: {
    color: '#5eead4',
  },
});
