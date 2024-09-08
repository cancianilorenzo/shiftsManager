'use strict';

const dayjs = require('dayjs');

//Select people for shifts
 function userSelection (users, shift, day, date, existingShift){
    console.log('inside userSelection')
    users.sort((a, b) => a.score - b.score);

    const choosen = [];
    for (const user of users) {
        if (!user.absences.includes(date) && !existingShift.includes(user.id) && choosen.length < shift) {
            choosen.push(user);
        }
    }
    choosen.forEach(user => {
        if (shift === 3) {
            user.score += 3;
        } else if (shift === 2) {
            user.score += 2;
        } 
    });
    return choosen;
}


// shiftCreator, where magic happens!
exports.createMonthlyShifts = (users, month, year) => {
    console.log('inside createMonthlyShifts')
    const weekDays = {
        domenica: 'Sunday',
        lunedi: 'Monday',
        mercoledi: 'Wednesday',
        venerdi: 'Friday',
    };

    const weeklyShifts = {
        [weekDays.domenica]: 3,
        [weekDays.lunedi]: 2,
        [weekDays.mercoledi]: 2,
        [weekDays.venerdi]: 3,
    };

    const monthlyShifts = [];
    const monthDays = dayjs(`${year}-${month}`).daysInMonth();

    for (let day = 1; day <= monthDays; day++) {
        const date = dayjs(`${year}-${month}-${day}`).format('YYYY-MM-DD');
        const weekDay = dayjs(date).format('dddd');

        if (weeklyShifts[weekDay]) {
            const shift = weeklyShifts[weekDay];

            // Get existing shifts for the day
            const existingShifts = monthlyShifts.filter(shift => shift.date === date).map(shift => shift.shift).flat();
            const dailyShifts = userSelection(users, shift, weekDay, date, existingShifts);

            monthlyShifts.push({ date, shift: dailyShifts.map(p => p.name) });
        }
    }
    console.log('exiting createMonthlyShifts')
    return monthlyShifts;
}


