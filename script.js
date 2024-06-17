document.addEventListener('DOMContentLoaded', function () {
    const exerciseForm = document.getElementById('exercise-form');
    const exerciseList = document.getElementById('exercise-list');
    const saveScheduleBtn = document.getElementById('save-schedule');
    const daysSelection = document.getElementById('days-selection');
    const todaysSchedule = document.getElementById('todays-schedule');
    const daysPassedEl = document.getElementById('days-passed');
    const daySelect = document.getElementById('day-select');
    const addDayBtn = document.getElementById('add-day');
    const renameDayBtn = document.getElementById('rename-day');
    const removeDayBtn = document.getElementById('remove-day'); // Nuovo pulsante
    const editScheduleBtn = document.getElementById('edit-schedule-btn');
    const editScheduleModal = document.getElementById('edit-schedule-modal');
    const closeEditModal = document.querySelector('.modal .close');

    let exercises = JSON.parse(localStorage.getItem('exercises')) || {};
    let selectedDays = JSON.parse(localStorage.getItem('selectedDays')) || [];
    let startDate = localStorage.getItem('startDate') || new Date().toISOString();

    function renderDayOptions() {
        daySelect.innerHTML = '';
        Object.keys(exercises).forEach(day => {
            const option = document.createElement('option');
            option.value = day;
            option.textContent = day;
            daySelect.appendChild(option);
        });
        renderExercises();
    }

    function renderExercises() {
        const selectedDay = daySelect.value;
        exerciseList.innerHTML = '';
        if (exercises[selectedDay]) {
            exercises[selectedDay].forEach((exercise, index) => {
                let setsReps = '';
                if (exercise.sets && exercise.reps) {
                    setsReps = `${exercise.sets} x ${exercise.reps}`;
                } else if (exercise.sets) {
                    setsReps = `${exercise.sets} serie`;
                } else if (exercise.reps) {
                    setsReps = `${exercise.reps} ripetizioni`;
                }

                const li = document.createElement('li');
                li.innerHTML = `${exercise.name}${setsReps ? `: ${setsReps}` : ''} <span data-index="${index}" class="remove-exercise"><i class="fas fa-trash button"></i></span>`;
                exerciseList.appendChild(li);
            });
        }
    }

    exerciseForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const exerciseName = document.getElementById('exercise-name').value;
        const sets = document.getElementById('sets').value;
        const reps = document.getElementById('reps').value;

        const exercise = {
            name: exerciseName,
            sets: sets,
            reps: reps
        };

        const selectedDay = daySelect.value;
        if (!exercises[selectedDay]) {
            exercises[selectedDay] = [];
        }

        exercises[selectedDay].push(exercise);
        localStorage.setItem('exercises', JSON.stringify(exercises));
        renderExercises();
        exerciseForm.reset();
    });

    saveScheduleBtn.addEventListener('click', function () {
        selectedDays = Array.from(document.querySelectorAll('#days-selection input[type="checkbox"]:checked')).map(cb => parseInt(cb.value));
        localStorage.setItem('selectedDays', JSON.stringify(selectedDays));
        localStorage.setItem('exercises', JSON.stringify(exercises));
        localStorage.setItem('startDate', startDate);
        alert('Scheda salvata!');
    });

    removeDayBtn.addEventListener('click', function () { // Nuova funzione di rimozione
        const selectedDay = daySelect.value;
        if (selectedDay && exercises[selectedDay]) {
            delete exercises[selectedDay];
            localStorage.setItem('exercises', JSON.stringify(exercises));
            renderDayOptions();
            renderExercises();
        }
    });

    addDayBtn.addEventListener('click', function () {
        const newDay = prompt('Nome della nuova giornata:');
        if (newDay && !exercises[newDay]) {
            exercises[newDay] = [];
            renderDayOptions();
            localStorage.setItem('exercises', JSON.stringify(exercises));
        }
    });

    renameDayBtn.addEventListener('click', function () {
        const selectedDay = daySelect.value;
        const newDayName = prompt('Nuovo nome per la giornata:', selectedDay);
        if (newDayName && newDayName !== selectedDay) {
            exercises[newDayName] = exercises[selectedDay];
            delete exercises[selectedDay];
            renderDayOptions();
            localStorage.setItem('exercises', JSON.stringify(exercises));
        }
    });

    daySelect.addEventListener('change', function () {
        renderExercises();
    });

    exerciseList.addEventListener('click', function (e) {
        if (e.target.classList.contains('fa-trash')) {
            const selectedDay = daySelect.value;
            const index = e.target.parentElement.getAttribute('data-index');
            exercises[selectedDay].splice(index, 1);
            localStorage.setItem('exercises', JSON.stringify(exercises));
            renderExercises();
        }
    });

    editScheduleBtn.addEventListener('click', function () {
        editScheduleModal.style.display = 'block';
    });

    closeEditModal.addEventListener('click', function () {
        editScheduleModal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        if (event.target === editScheduleModal) {
            editScheduleModal.style.display = 'none';
        }
    });

    function assignScheduleToToday() {
        const currentDate = new Date();
        const start = new Date(startDate);
        const timeDiff = Math.abs(currentDate - start);
        const daysPassed = Math.ceil(timeDiff / (1000 * 3600 * 24));

        const today = currentDate.getDay();
        const selectedDayIndex = selectedDays.indexOf(today);
        let todaysDay;

        if (selectedDayIndex !== -1) {
            todaysDay = Object.keys(exercises)[selectedDayIndex % Object.keys(exercises).length];
        } else {
            todaysDay = null;
        }

        if (todaysDay) {
            const todaysExercise = exercises[todaysDay];
            todaysSchedule.innerHTML = todaysExercise 
                ? todaysExercise.map(e => {
                    let setsReps = '';
                    if (e.sets && e.reps) {
                        setsReps = `${e.sets} x ${e.reps}`;
                    } else if (e.sets) {
                        setsReps = `${e.sets} serie`;
                    } else if (e.reps) {
                        setsReps = `${e.reps} ripetizioni`;
                    }
                    return `${e.name}${setsReps ? `: ${setsReps}` : ''}`;
                }).join('<br>')
                : 'Nessuna scheda assegnata per oggi';
        } else {
            todaysSchedule.textContent = 'Oggi non hai nessuna scheda salvata';
        }

        daysPassedEl.textContent = `Giorni passati dall'inizio: ${daysPassed}`;
    }

    renderDayOptions();
    assignScheduleToToday();
});