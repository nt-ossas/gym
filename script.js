document.addEventListener('DOMContentLoaded', function () {
    const exerciseForm = document.getElementById('exercise-form');
    const exerciseList = document.getElementById('exercise-list');
    const saveScheduleBtn = document.getElementById('save-schedule');
    const todaysSchedule = document.getElementById('todays-schedule');
    const daysPassedEl = document.getElementById('days-passed');
    const daySelect = document.getElementById('day-select');
    const addDayBtn = document.getElementById('add-day');
    const renameDayBtn = document.getElementById('rename-day');
    const removeDayBtn = document.getElementById('remove-day');
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
                li.classList.add("ex");
                li.innerHTML = `${exercise.name}${setsReps ? `: ${setsReps}` : ''} <span data-index="${index}" class="remove-exercise"><i class="fas fa-trash button ex"></i></span>`;
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
        console.log('Giorni selezionati per la palestra:', selectedDays);
        location.reload();
    });

    removeDayBtn.addEventListener('click', function () {
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
        location.reload();
    });

    window.addEventListener('click', function (event) {
        if (event.target === editScheduleModal) {
            location.reload();
        }
    });

    function assignScheduleToToday() {
        const currentDate = new Date();
        const start = new Date(startDate);
        const timeDiff = Math.abs(currentDate - start);
        const daysPassed = Math.ceil(timeDiff / (1000 * 3600 * 24));

        const today = currentDate.getDay();

        if (!selectedDays.includes(today)) {
            todaysSchedule.textContent = 'Oggi non hai nessuna scheda salvata';
            daysPassedEl.textContent = `Giorni passati dall'inizio: ${daysPassed}`;
            return;
        }

        const selectedDayIndex = selectedDays.indexOf(today);
        let todaysDay;

        if (selectedDayIndex !== -1) {
            todaysDay = Object.keys(exercises)[selectedDayIndex % Object.keys(exercises).length];
        } else {
            todaysDay = null;
        }

        if (todaysDay) {
            const todaysExercise = exercises[todaysDay];
            const completedExercises = JSON.parse(localStorage.getItem('completedExercises')) || {};
            const todaysCompleted = completedExercises[todaysDay] || [];

            todaysSchedule.innerHTML = `<h3>${todaysDay}</h3>`;
            todaysSchedule.innerHTML += todaysExercise
                ? todaysExercise.map((e, i) => {
                    let setsReps = '';
                    if (e.sets && e.reps) {
                        setsReps = `${e.sets} x ${e.reps}`;
                    } else if (e.sets) {
                        setsReps = `${e.sets} serie`;
                    } else if (e.reps) {
                        setsReps = `${e.reps} ripetizioni`;
                    }
                    return `
                        <div>
                            <input type="checkbox" id="exercise-${i}" class="check-ex" data-index="${i}" ${todaysCompleted.includes(i) ? 'checked' : ''}>
                            <label for="exercise-${i}">${e.name}${setsReps ? `: ${setsReps}` : ''}</label>
                        </div>
                    `;
                }).join('<br>')
                : 'Nessuna scheda assegnata per oggi';

            document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.addEventListener('change', function () {
                    const index = parseInt(this.dataset.index);
                    if (this.checked) {
                        if (!todaysCompleted.includes(index)) {
                            todaysCompleted.push(index);
                        }
                    } else {
                        const idx = todaysCompleted.indexOf(index);
                        if (idx > -1) {
                            todaysCompleted.splice(idx, 1);
                        }
                    }
                    completedExercises[todaysDay] = todaysCompleted;
                    localStorage.setItem('completedExercises', JSON.stringify(completedExercises));
                });
            });
        } else {
            todaysSchedule.textContent = 'Oggi non hai nessuna scheda salvata';
        }

        daysPassedEl.textContent = `Giorni passati dall'inizio: ${daysPassed}`;
    }

    function setInitialCheckboxStates() {
        const checkboxes = document.querySelectorAll('#days-selection input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (selectedDays.includes(parseInt(checkbox.value))) {
                checkbox.checked = true;
            }
        });
    }

    renderDayOptions();
    assignScheduleToToday();
    setInitialCheckboxStates();
});