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
    const button = document.getElementById("notification");

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
                li.draggable = true;
                li.setAttribute('data-index', index);
                li.innerHTML = `${exercise.name}${setsReps ? `: ${setsReps}` : ''} <span data-index="${index}" class="remove-exercise"><i class="fas fa-trash button ex"></i></span>`;
                exerciseList.appendChild(li);

                li.addEventListener('dragstart', handleDragStart);
                li.addEventListener('dragover', handleDragOver);
                li.addEventListener('drop', handleDrop);
                li.addEventListener('dragend', handleDragEnd);
            });
        }
    }

    function handleDragStart(e) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', e.target.getAttribute('data-index'));
        e.target.classList.add('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const draggingElement = document.querySelector('.dragging');
        const currentHoveredElement = e.target.closest('li.ex');
        if (currentHoveredElement && currentHoveredElement !== draggingElement) {
            const bounding = currentHoveredElement.getBoundingClientRect();
            const offset = bounding.y + (bounding.height / 2);
            const parent = currentHoveredElement.parentNode;
            if (e.clientY - offset > 0) {
                parent.insertBefore(draggingElement, currentHoveredElement.nextSibling);
            } else {
                parent.insertBefore(draggingElement, currentHoveredElement);
            }
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        const draggedIndex = e.dataTransfer.getData('text/plain');
        const dropTargetIndex = e.target.getAttribute('data-index');
        if (draggedIndex !== dropTargetIndex) {
            const selectedDay = daySelect.value;
            const draggedExercise = exercises[selectedDay].splice(draggedIndex, 1)[0];
            exercises[selectedDay].splice(dropTargetIndex, 0, draggedExercise);
            localStorage.setItem('exercises', JSON.stringify(exercises));
            renderExercises();
        }
    }

    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
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

    button.addEventListener("click", () => {
        Notification.requestPermission().then(perm => {
            var orario = document.getElementById("orario").value;
            if (perm === "granted") {
                new Notification("L'allenamento è stato impostato per le " + orario);
    
                if (selectedDays.includes(new Date().getDay())) {
                    const notificationTime = new Date();
                    notificationTime.setHours(parseInt(orario.split(":")[0]));
                    notificationTime.setMinutes(parseInt(orario.split(":")[1]) - 30);
                    const now = new Date();
                    const timeUntilNotification = notificationTime - now;
    
                    if (timeUntilNotification > 0) {
                        setTimeout(() => {
                            new Notification("Ricorda di allenarti!", { body: `Allenamento programmato per le ${orario}` });
                        }, timeUntilNotification);
                    }
                }
            }
        });
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

window.onload = function() {
    var larghezzaPagina = window.innerWidth;
    const alert = document.getElementById("alert");

    if (larghezzaPagina > 800) {
        alert.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Il sito non è ancora stato adattato per questo dispositivo. <i class="fa-solid fa-triangle-exclamation"></i>`;
        alert.classList.add("container");
        alert.style.color = "#ff5722";
    }
}

function broken(){
    alert("Questa funzione è ancora in fase di sviluppo, mi scuso per l'incoveniente!");
}


document.addEventListener("DOMContentLoaded", function() {
    const animationContainer = document.getElementById("animation-container");
    const content = document.getElementById("content");

    setTimeout(function() {
        animationContainer.style.display = "none";
        content.style.display = "block";
    }, 3000);
});