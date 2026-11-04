// Smart Routine Store - Supports Gym Enthusiasts, Patients & General Daily Routine Users
const { v4: uuidv4 } = require('uuid');

const store = {
  users: [
    {
      id: 'usr_mayur_1',
      name: 'Mayur',
      email: 'mayur@smartroutine.com',
      role: 'user',
      profileType: 'general',
      deviceId: 'ESP8266-SR-01',
      age: 24,
      goal: 'Daily Schedules, Medicines, Meals & Habits',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      createdAt: '2026-02-01T08:00:00.000Z'
    }
  ],

  // Routines list (Medicines, Meals, Gym Supplements, Water & Habits)
  routines: [
    // Gym Routines
    {
      id: 'rtn_gym_1',
      userId: 'usr_mayur_1',
      itemType: 'meal',
      name: 'Breakfast: Oatmeal & 3 Boiled Eggs',
      timeSlot: '08:00',
      category: 'Breakfast',
      dosage: '50g Oats + 3 Eggs (High Protein)',
      mealType: 'Breakfast',
      foodRelation: 'None',
      compartment: 1,
      notes: 'Wholesome morning nutrition and energy',
      activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      isActive: true
    },
    {
      id: 'rtn_gym_2',
      userId: 'usr_mayur_1',
      itemType: 'medicine',
      name: 'Daily Multivitamin & Fish Oil Softgel',
      timeSlot: '08:30',
      category: 'Vitamins & Supplements',
      dosage: '1 Capsule + 1 Softgel',
      mealType: 'Breakfast',
      foodRelation: 'After Meal',
      compartment: 1,
      notes: 'Take with warm water right after breakfast',
      activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      isActive: true
    },
    {
      id: 'rtn_gym_3',
      userId: 'usr_mayur_1',
      itemType: 'meal',
      name: 'Lunch: Grilled Chicken / Paneer, Rice & Salad',
      timeSlot: '13:00',
      category: 'Lunch',
      dosage: 'Full Meal (2 Chapatis + 150g Protein + Veggies)',
      mealType: 'Lunch',
      foodRelation: 'None',
      compartment: 2,
      notes: 'Substantial balanced lunch',
      activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      isActive: true
    },
    {
      id: 'rtn_gym_4',
      userId: 'usr_mayur_1',
      itemType: 'workout',
      name: 'Pre-Workout Snack: Banana & Black Coffee',
      timeSlot: '17:00',
      category: 'Gym & Fitness',
      dosage: '1 Banana + 1 Cup Black Coffee',
      mealType: 'Pre-Workout',
      foodRelation: 'Before Meal',
      compartment: 2,
      notes: 'Take 30 minutes before workout session',
      activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      isActive: true
    },
    {
      id: 'rtn_gym_5',
      userId: 'usr_mayur_1',
      itemType: 'workout',
      name: 'Post-Workout: Whey Protein Shake + 5g Creatine',
      timeSlot: '19:00',
      category: 'Gym & Fitness',
      dosage: '1 Scoop Whey (24g Protein) + 5g Creatine',
      mealType: 'Post-Workout',
      foodRelation: 'After Meal',
      compartment: 3,
      notes: 'Mix with 250ml cold water immediately post-workout',
      activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      isActive: true
    },
    {
      id: 'rtn_gym_6',
      userId: 'usr_mayur_1',
      itemType: 'meal',
      name: 'Dinner: Whole Wheat Roti, Dal & Steamed Veggies',
      timeSlot: '20:30',
      category: 'Dinner',
      dosage: '2 Roti + Lentil Soup + Salad',
      mealType: 'Dinner',
      foodRelation: 'None',
      compartment: 3,
      notes: 'Light and easily digestible evening meal',
      activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      isActive: true
    },

    // Patient Routines
    {
      id: 'rtn_pat_1',
      userId: 'usr_mayur_1',
      itemType: 'meal',
      name: 'Breakfast: Oatmeal Porridge & Warm Milk',
      timeSlot: '08:00',
      category: 'Breakfast',
      dosage: '1 Bowl Porridge + 1 Cup Skim Milk',
      mealType: 'Breakfast',
      foodRelation: 'None',
      compartment: 1,
      notes: 'Essential timely breakfast before morning medication',
      activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      isActive: true
    },
    {
      id: 'rtn_pat_2',
      userId: 'usr_mayur_1',
      itemType: 'medicine',
      name: 'Metformin HCl 500mg (Diabetes Tablet)',
      timeSlot: '08:30',
      category: 'Diabetes Care',
      dosage: '1 Tablet (500mg)',
      mealType: 'Breakfast',
      foodRelation: 'After Meal',
      compartment: 1,
      notes: 'Take immediately after breakfast with plenty of water',
      activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      isActive: true
    },
    {
      id: 'rtn_pat_3',
      userId: 'usr_mayur_1',
      itemType: 'meal',
      name: 'Lunch: 2 Chapatis, Green Veggies & Dal-Rice',
      timeSlot: '13:00',
      category: 'Lunch',
      dosage: '2 Chapatis + 1 Bowl Veg + Half Bowl Rice',
      mealType: 'Lunch',
      foodRelation: 'None',
      compartment: 2,
      notes: 'Balanced midday nutrition',
      activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      isActive: true
    },
    {
      id: 'rtn_pat_4',
      userId: 'usr_mayur_1',
      itemType: 'medicine',
      name: 'Multivitamin & Calcium Capsule',
      timeSlot: '13:30',
      category: 'Vitamins & Minerals',
      dosage: '1 Capsule',
      mealType: 'Lunch',
      foodRelation: 'After Meal',
      compartment: 3,
      notes: 'Take after lunch with water',
      activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      isActive: true
    },
    {
      id: 'rtn_pat_5',
      userId: 'usr_mayur_1',
      itemType: 'medicine',
      name: 'BP Capsule (Telmisartan 40mg)',
      timeSlot: '20:00',
      category: 'Blood Pressure Care',
      dosage: '1 Tablet (40mg)',
      mealType: 'Dinner',
      foodRelation: 'Before Meal',
      compartment: 2,
      notes: 'Take 30 minutes before evening dinner',
      activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      isActive: true
    },
    {
      id: 'rtn_pat_6',
      userId: 'usr_mayur_1',
      itemType: 'meal',
      name: 'Dinner: Light Moong Dal Khichdi & Curd',
      timeSlot: '20:30',
      category: 'Dinner',
      dosage: '1 Bowl Khichdi + Fresh Curd',
      mealType: 'Dinner',
      foodRelation: 'None',
      compartment: 3,
      notes: 'Light evening dinner for easy digestion',
      activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      isActive: true
    },
    {
      id: 'rtn_pat_7',
      userId: 'usr_mayur_1',
      itemType: 'medicine',
      name: 'Atorvastatin 10mg (Cholesterol Tablet)',
      timeSlot: '21:30',
      category: 'Cardiovascular Care',
      dosage: '1 Tablet (10mg)',
      mealType: 'Dinner',
      foodRelation: 'After Meal',
      compartment: 3,
      notes: 'Take at bedtime after dinner',
      activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      isActive: true
    }
  ],

  medicines: [],

  reminders: [
    {
      id: 'rem_1',
      userId: 'usr_mayur_1',
      routineId: 'rtn_pat_1',
      scheduledTime: '08:00',
      scheduledDate: new Date().toISOString().split('T')[0],
      compartment: 1,
      status: 'Completed',
      actualTime: '08:05',
      confirmedBy: 'web',
      notes: 'Breakfast completed on time'
    },
    {
      id: 'rem_2',
      userId: 'usr_mayur_1',
      routineId: 'rtn_pat_2',
      scheduledTime: '08:30',
      scheduledDate: new Date().toISOString().split('T')[0],
      compartment: 1,
      status: 'Completed',
      actualTime: '08:32',
      confirmedBy: 'esp8266_button',
      notes: 'Metformin tablet confirmed via ESP8266 button'
    },
    {
      id: 'rem_3',
      userId: 'usr_mayur_1',
      routineId: 'rtn_pat_3',
      scheduledTime: '13:00',
      scheduledDate: new Date().toISOString().split('T')[0],
      compartment: 2,
      status: 'Upcoming',
      actualTime: null,
      confirmedBy: null,
      notes: 'Scheduled for lunch'
    },
    {
      id: 'rem_4',
      userId: 'usr_mayur_1',
      routineId: 'rtn_pat_4',
      scheduledTime: '13:30',
      scheduledDate: new Date().toISOString().split('T')[0],
      compartment: 3,
      status: 'Upcoming',
      actualTime: null,
      confirmedBy: null,
      notes: 'Multivitamin capsule after lunch'
    },
    {
      id: 'rem_5',
      userId: 'usr_mayur_1',
      routineId: 'rtn_pat_5',
      scheduledTime: '20:00',
      scheduledDate: new Date().toISOString().split('T')[0],
      compartment: 2,
      status: 'Upcoming',
      actualTime: null,
      confirmedBy: null,
      notes: 'Blood pressure medication before dinner'
    },
    {
      id: 'rem_6',
      userId: 'usr_mayur_1',
      routineId: 'rtn_pat_6',
      scheduledTime: '20:30',
      scheduledDate: new Date().toISOString().split('T')[0],
      compartment: 3,
      status: 'Upcoming',
      actualTime: null,
      confirmedBy: null,
      notes: 'Evening dinner'
    },
    {
      id: 'rem_7',
      userId: 'usr_mayur_1',
      routineId: 'rtn_pat_7',
      scheduledTime: '21:30',
      scheduledDate: new Date().toISOString().split('T')[0],
      compartment: 3,
      status: 'Upcoming',
      actualTime: null,
      confirmedBy: null,
      notes: 'Bedtime cholesterol pill'
    }
  ],

  devices: [
    {
      id: 'ESP8266-SR-01',
      userId: 'usr_mayur_1',
      model: 'NodeMCU ESP8266 V1.0 / Wemos D1 Mini',
      firmwareVersion: 'v2.1-SmartRoutine',
      status: 'online',
      ipAddress: '10.99.33.207',
      wifiSSID: 'Home_WiFi',
      buzzerActive: false,
      ledStatus: 'idle_green',
      lcdLine1: 'Smart Routine',
      lcdLine2: 'System Ready',
      lastHeartbeat: new Date().toISOString()
    }
  ],

  adherenceHistory: [
    { day: 'Mon', date: '2026-10-27', scheduled: 6, confirmed: 6, missed: 0, rate: 100 },
    { day: 'Tue', date: '2026-10-28', scheduled: 6, confirmed: 5, missed: 1, rate: 83 },
    { day: 'Wed', date: '2026-10-29', scheduled: 6, confirmed: 6, missed: 0, rate: 100 },
    { day: 'Thu', date: '2026-10-30', scheduled: 6, confirmed: 5, missed: 1, rate: 83 },
    { day: 'Fri', date: '2026-10-31', scheduled: 6, confirmed: 6, missed: 0, rate: 100 },
    { day: 'Sat', date: '2026-11-01', scheduled: 6, confirmed: 5, missed: 1, rate: 83 },
    { day: 'Sun', date: '2026-11-02', scheduled: 6, confirmed: 6, missed: 0, rate: 100 }
  ]
};

module.exports = store;
