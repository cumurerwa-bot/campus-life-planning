const STORAGE_KEY = "campuslifeplannerActivities";
const TARGET_KEY = "campuslifeplannerTarget";
const DEFAULT_TARGET = 5;

let activities = [];
let editingID = null;

const activityform = document.getElementById("activity-form");
const activityIdinput = document.getElementById("activity-id");
const titleinput = document.getElementById("title");
const categoryinput = document.getElementById("category");
const dateinput = document.getElementById("date");
const timeinput = document.getElementById("time");
const priorityinput = document.getElementById("priority");
const descriptioninput = document.getElementById("description");

const formmessage = document.getElementById("form-message");
const activitylist = document.getElementById("activity-list");

const searchinput = document.getElementById("search-input");
const sortselect = document.getElementById("sort-select");

const totalActivities = document.getElementById("total-activities");
const completedActivities = document.getElementById("completed-activities");
const upcomingActivities = document.getElementById("upcoming-activities");
const topcategory = document.getElementById("top-category");
const weeklytrend = document.getElementById("weekly-trend");

const targetinput = document.getElementById("target-input");
const savetarget = document.getElementById("save-target");
const targetmessage = document.getElementById("target-message");
const targetprogress = document.getElementById("target-progress");
const targetstatus = document.getElementById("target-status");

const exportbutton = document.getElementById("export-button");
const importbutton = document.getElementById("import-button");
const importfileinput = document.getElementById("import-file");
const loadsamplesButton = document.getElementById("load-samples");
const clearAllButton = document.getElementById("clear-all");

const resetFormButton = document.getElementById("reset-form");
const formHeading = document.getElementById("form-heading");

const darkModeToggle = document.getElementById("dark-mode-toggle");

// ── PATTERNS ────────────────────────────────────────────────────────────────

const titlepattern =
    /^(?=.{3,80}$)[A-Za-z0-9](?:[A-Za-z0-9 '\-]*[A-Za-z0-9])?$/;

const descriptionpattern =
    /^[A-Za-z0-9\s.,!?'"():;\-]{0,300}$/;

const timepattern =
    /^(?:[01]\d|2[0-3]):[0-5]\d$/;

const categorypattern =
    /^[A-Za-z ]{2,30}$/;

// ── UTILITIES ────────────────────────────────────────────────────────────────

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showMessage(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.className = "message " + (type || "info");
}

function clearMessage(element) {
    if (!element) return;
    element.textContent = "";
    element.className = "message";
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function isValidDate(datestring) {
    if (typeof datestring !== "string") return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datestring)) return false;
    const date = new Date(datestring + "T00:00:00");
    return (
        !Number.isNaN(date.getTime()) &&
        date.getFullYear() === Number(datestring.slice(0, 4)) &&
        date.getMonth() + 1 === Number(datestring.slice(5, 7)) &&
        date.getDate() === Number(datestring.slice(8, 10))
    );
}

function formatDate(datestring) {
    if (!isValidDate(datestring)) return datestring;
    const date = new Date(datestring + "T00:00:00");
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function isCompleted(activity) {
    return activity.status === "completed";
}

// ── DARK MODE ────────────────────────────────────────────────────────────────

function applyDarkMode(isDark) {
    document.body.classList.toggle("dark-mode", isDark);
    if (darkModeToggle) {
        darkModeToggle.setAttribute("aria-pressed", String(isDark));
        darkModeToggle.textContent = isDark ? "Light Mode" : "Dark Mode";
    }
}

function initDarkMode() {
    const saved = localStorage.getItem("darkMode");
    applyDarkMode(saved === "true");
}

function handleDarkModeToggle() {
    const isDark = document.body.classList.contains("dark-mode");
    const next = !isDark;
    applyDarkMode(next);
    localStorage.setItem("darkMode", String(next));
}

// ── VALIDATION ───────────────────────────────────────────────────────────────

function validateRecord(record) {
    const errors = [];

    if (!record || typeof record !== "object" || Array.isArray(record)) {
        return ["The activity must be an object."];
    }

    if (
        typeof record.title !== "string" ||
        !titlepattern.test(record.title.trim())
    ) {
        errors.push(
            "Title must be 3-80 characters and use valid letters, numbers, spaces, apostrophes, or hyphens."
        );
    }

    if (
        typeof record.category !== "string" ||
        !categorypattern.test(record.category.trim())
    ) {
        errors.push("Category must contain 2-30 letters and spaces.");
    }

    if (!isValidDate(record.date)) {
        errors.push("Enter a valid date.");
    }

    if (typeof record.time !== "string" || !timepattern.test(record.time)) {
        errors.push("Enter a valid time in HH:MM format.");
    }

    if (!["low", "medium", "high"].includes(record.priority)) {
        errors.push("Choose a valid priority.");
    }

    if (
        typeof record.description !== "string" ||
        !descriptionpattern.test(record.description)
    ) {
        errors.push(
            "Description must be 300 characters or fewer and use valid punctuation."
        );
    }

    if (!["planned", "completed"].includes(record.status)) {
        errors.push("Choose a valid activity status.");
    }

    return errors;
}

function validateForm() {
    const title = titleinput.value.trim();
    const category = categoryinput.value.trim();
    const date = dateinput.value.trim();
    const time = timeinput.value.trim();
    const priority = priorityinput.value.trim();
    const description = descriptioninput.value.trim();

    const errors = [];

    if (!titlepattern.test(title)) {
        errors.push(
            "Title must be 3-80 characters and use valid letters, numbers, spaces, apostrophes, or hyphens."
        );
    }

    if (!categorypattern.test(category)) {
        errors.push("Category must contain 2-30 letters and spaces.");
    }

    if (!isValidDate(date)) {
        errors.push("Please select a valid date.");
    }

    if (!timepattern.test(time)) {
        errors.push("Please enter a valid time, such as 09:30 or 14:00.");
    }

    if (!["low", "medium", "high"].includes(priority)) {
        errors.push("Please select a valid priority.");
    }

    if (!descriptionpattern.test(description)) {
        errors.push(
            "Description can contain up to 300 characters and must use supported punctuation."
        );
    }

    return errors;
}

// ── STORAGE ──────────────────────────────────────────────────────────────────

function saveActivities() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
    } catch (error) {
        console.error("Could not save activities:", error);
        showMessage(
            formmessage,
            "Your browser could not save the activities.",
            "error"
        );
    }
}

function loadActivities() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) {
            activities = [];
            return;
        }
        const parsedData = JSON.parse(savedData);
        if (!Array.isArray(parsedData)) {
            throw new Error("Saved data is not an array.");
        }
        activities = parsedData.filter((record) => {
            return (
                validateRecord(record).length === 0 &&
                typeof record.id === "string"
            );
        });
    } catch (error) {
        console.error("Could not load saved activities:", error);
        activities = [];
    }
}

function saveTarget(target) {
    try {
        localStorage.setItem(TARGET_KEY, String(target));
    } catch (error) {
        console.error("Could not save target:", error);
    }
}

function loadTarget() {
    try {
        const savedTarget = localStorage.getItem(TARGET_KEY);
        if (savedTarget === null) return DEFAULT_TARGET;
        const target = Number(savedTarget);
        if (Number.isInteger(target) && target >= 1 && target <= 1000000) {
            return target;
        }
        return DEFAULT_TARGET;
    } catch (error) {
        console.error("Could not load target:", error);
        return DEFAULT_TARGET;
    }
}

// ── FORM ─────────────────────────────────────────────────────────────────────

function handleFormSubmit(event) {
    event.preventDefault();
    clearMessage(formmessage);

    const errors = validateForm();

    if (errors.length > 0) {
        showMessage(formmessage, errors.join(" "), "error");
        return;
    }

    const activityData = {
        title: titleinput.value.trim(),
        category: categoryinput.value.trim(),
        date: dateinput.value,
        time: timeinput.value,
        priority: priorityinput.value,
        description: descriptioninput.value.trim()
    };

    if (editingID) {
        const existingActivity = activities.find(
            (activity) => activity.id === editingID
        );

        if (!existingActivity) {
            showMessage(
                formmessage,
                "The activity you are editing could not be found.",
                "error"
            );
            return;
        }

        Object.assign(existingActivity, activityData);
        existingActivity.updatedAt = new Date().toISOString();

        showMessage(formmessage, "Activity updated successfully!", "success");
        editingID = null;
    } else {
        const newActivity = {
            id: generateId(),
            ...activityData,
            status: "planned",
            createdAt: new Date().toISOString()
        };

        activities.push(newActivity);
        showMessage(formmessage, "Activity added successfully!", "success");
    }

    saveActivities();
    renderAll();
    resetFormFields();
}

function resetFormFields() {
    activityform.reset();
    editingID = null;
    activityIdinput.value = "";

    if (formHeading) {
        formHeading.textContent = "Add a new activity";
    }
    if (resetFormButton) {
        resetFormButton.textContent = "Clear form";
    }
}

function handleResetForm() {
    resetFormFields();
    clearMessage(formmessage);
}

// ── EDIT / DELETE / TOGGLE ───────────────────────────────────────────────────

function editActivity(id) {
    const activity = activities.find((item) => item.id === id);

    if (!activity) {
        showMessage(formmessage, "Activity not found.", "error");
        return;
    }

    editingID = id;

    activityIdinput.value = activity.id;
    titleinput.value = activity.title;
    categoryinput.value = activity.category;
    dateinput.value = activity.date;
    timeinput.value = activity.time;
    priorityinput.value = activity.priority;
    descriptioninput.value = activity.description;

    if (formHeading) formHeading.textContent = "Edit activity";
    if (resetFormButton) resetFormButton.textContent = "Cancel editing";

    showMessage(
        formmessage,
        "Update the fields and submit the form to save your changes.",
        "info"
    );

    titleinput.focus();

    document.getElementById("add-activity").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function deleteActivity(id) {
    const activity = activities.find((item) => item.id === id);
    if (!activity) return;

    const confirmed = window.confirm(
        `Are you sure you want to delete "${activity.title}"?`
    );

    if (!confirmed) return;

    activities = activities.filter((item) => item.id !== id);

    if (editingID === id) {
        resetFormFields();
    }

    saveActivities();
    renderAll();

    showMessage(formmessage, "Activity deleted successfully.", "success");
}

function toggleActivityStatus(id) {
    const activity = activities.find((item) => item.id === id);
    if (!activity) return;

    activity.status = isCompleted(activity) ? "planned" : "completed";
    activity.updatedAt = new Date().toISOString();

    saveActivities();
    renderAll();
}

// ── SEARCH & SORT ────────────────────────────────────────────────────────────

function searchActivities(records, searchText) {
    const query = searchText.trim();
    if (query === "") return records;

    try {
        const searchRegex = new RegExp(query, "i");
        return records.filter((activity) => {
            const searchableText = [
                activity.title,
                activity.category,
                activity.description,
                activity.priority,
                activity.status,
                activity.date
            ].join(" ");
            return searchRegex.test(searchableText);
        });
    } catch (error) {
        showMessage(
            document.getElementById("search-message"),
            "Invalid search pattern. Please check your regular expression.",
            "error"
        );
        return [];
    }
}

function highlightText(text, searchText) {
    const safeText = escapeHTML(text);
    const query = searchText.trim();
    if (query === "") return safeText;

    try {
        const regex = new RegExp(query, "gi");
        return safeText.replace(regex, (match) => `<mark>${match}</mark>`);
    } catch (error) {
        return safeText;
    }
}

function sortActivities(records, sortValue) {
    const sorted = [...records];

    switch (sortValue) {
        case "date-asc":
            sorted.sort((a, b) => {
                return (
                    new Date(`${a.date}T${a.time}`) -
                    new Date(`${b.date}T${b.time}`)
                );
            });
            break;

        case "date-desc":
            sorted.sort((a, b) => {
                return (
                    new Date(`${b.date}T${b.time}`) -
                    new Date(`${a.date}T${a.time}`)
                );
            });
            break;

        case "title-asc":
            sorted.sort((a, b) => a.title.localeCompare(b.title));
            break;

        case "priority": {
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            sorted.sort((a, b) => {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            });
            break;
        }

        default:
            sorted.sort((a, b) => {
                return (
                    new Date(`${a.date}T${a.time}`) -
                    new Date(`${b.date}T${b.time}`)
                );
            });
    }

    return sorted;
}

// ── RENDER ───────────────────────────────────────────────────────────────────

function renderActivities() {
    if (!activitylist) return;

    clearMessage(document.getElementById("search-message"));

    const searchText = searchinput ? searchinput.value : "";
    const sortValue = sortselect ? sortselect.value : "date-asc";

    const filteredActivities = searchActivities(activities, searchText);
    const sortedActivities = sortActivities(filteredActivities, sortValue);

    if (sortedActivities.length === 0) {
        activitylist.innerHTML = `
            <div class="empty-state">
                <h3>No activities found</h3>
                <p>Add an activity or change your search.</p>
            </div>
        `;
        return;
    }

    activitylist.innerHTML = sortedActivities
        .map((activity) => {
            const completedClass = isCompleted(activity) ? " completed" : "";
            const statusText = isCompleted(activity) ? "Completed" : "Planned";
            const toggleButtonText = isCompleted(activity)
                ? "Mark as planned"
                : "Mark as completed";

            const highlightedTitle = highlightText(activity.title, searchText);
            const highlightedCategory = highlightText(
                activity.category,
                searchText
            );
            const highlightedDescription = highlightText(
                activity.description || "No description provided.",
                searchText
            );

            return `
                <article class="activity-card${completedClass}">
                    <div class="activity-card-header">
                        <div>
                            <h3>${highlightedTitle}</h3>
                            <p class="activity-category">${highlightedCategory}</p>
                        </div>
                        <span class="priority priority-${escapeHTML(activity.priority)}">
                            ${escapeHTML(activity.priority)}
                        </span>
                    </div>

                    <p class="activity-description">${highlightedDescription}</p>

                    <div class="activity-details">
                        <span><strong>Date:</strong> ${escapeHTML(formatDate(activity.date))}</span>
                        <span><strong>Time:</strong> ${escapeHTML(activity.time)}</span>
                        <span><strong>Status:</strong> ${escapeHTML(statusText)}</span>
                    </div>

                    <div class="activity-actions">
                        <button
                            type="button"
                            class="button button-secondary"
                            data-action="toggle"
                            data-id="${escapeHTML(activity.id)}"
                            aria-label="${escapeHTML(toggleButtonText)}: ${escapeHTML(activity.title)}">
                            ${escapeHTML(toggleButtonText)}
                        </button>

                        <button
                            type="button"
                            class="button button-secondary"
                            data-action="edit"
                            data-id="${escapeHTML(activity.id)}"
                            aria-label="Edit ${escapeHTML(activity.title)}">
                            Edit
                        </button>

                        <button
                            type="button"
                            class="button button-danger"
                            data-action="delete"
                            data-id="${escapeHTML(activity.id)}"
                            aria-label="Delete ${escapeHTML(activity.title)}">
                            Delete
                        </button>
                    </div>
                </article>
            `;
        })
        .join("");
}

function handleActivityListClick(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    const id = button.dataset.id;

    if (action === "edit") {
        editActivity(id);
    } else if (action === "delete") {
        deleteActivity(id);
    } else if (action === "toggle") {
        toggleActivityStatus(id);
    }
}

// ── STATS ────────────────────────────────────────────────────────────────────

function renderStats() {
    if (totalActivities) totalActivities.textContent = activities.length;

    const completedCount = activities.filter((a) => isCompleted(a)).length;
    if (completedActivities) completedActivities.textContent = completedCount;

    const today = getTodayString();
    const upcomingCount = activities.filter((activity) => {
        return !isCompleted(activity) && activity.date >= today;
    }).length;
    if (upcomingActivities) upcomingActivities.textContent = upcomingCount;

    renderTopCategory();
    renderWeeklyTrend();
}

function renderTopCategory() {
    if (!topcategory) return;

    if (activities.length === 0) {
        topcategory.textContent = "None yet";
        return;
    }

    const categoryCounts = {};
    activities.forEach((activity) => {
        const category = activity.category;
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    let mostCommonCategory = "";
    let highestCount = 0;

    Object.entries(categoryCounts).forEach(([category, count]) => {
        if (count > highestCount) {
            mostCommonCategory = category;
            highestCount = count;
        }
    });

    topcategory.textContent = `${mostCommonCategory} (${highestCount})`;
}

function renderWeeklyTrend() {
    if (!weeklytrend) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];

    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(today);
        currentDay.setDate(today.getDate() + i);

        const year = currentDay.getFullYear();
        const month = String(currentDay.getMonth() + 1).padStart(2, "0");
        const day = String(currentDay.getDate()).padStart(2, "0");
        const dateString = `${year}-${month}-${day}`;

        const count = activities.filter(
            (activity) => activity.date === dateString
        ).length;

        days.push({
            label: currentDay.toLocaleDateString(undefined, {
                weekday: "short"
            }),
            count
        });
    }

    const maximum = Math.max(1, ...days.map((day) => day.count));

    weeklytrend.innerHTML = days
        .map((day) => {
            const percentage = Math.round((day.count / maximum) * 100);
            return `
                <div class="trend-row">
                    <span class="trend-day">${escapeHTML(day.label)}</span>
                    <div class="trend-bar-track">
                        <div class="trend-bar" style="width:${percentage}%"></div>
                    </div>
                    <span class="trend-count">${day.count}</span>
                </div>
            `;
        })
        .join("");
}

// ── TARGET ───────────────────────────────────────────────────────────────────

function updateTargetDisplay() {
    const target = loadTarget();

    if (targetinput) targetinput.value = target;

    const completedCount = activities.filter((a) => isCompleted(a)).length;
    const percentage = Math.min(
        100,
        Math.round((completedCount / target) * 100)
    );

    if (targetprogress) {
        targetprogress.value = percentage;
        targetprogress.textContent = `${percentage}%`;
    }

    if (targetstatus) {
        targetstatus.textContent = `${completedCount} of ${target} activities completed (${percentage}%)`;
    }
}

function handleSaveTarget() {
    clearMessage(targetmessage);

    const value = Number(targetinput.value);

    if (!Number.isInteger(value) || value < 1 || value > 1000000) {
        showMessage(
            targetmessage,
            "Please enter a whole number between 1 and 1,000,000.",
            "error"
        );
        return;
    }

    saveTarget(value);
    updateTargetDisplay();
    showMessage(targetmessage, "Target saved!", "success");
}

// ── EXPORT / IMPORT ──────────────────────────────────────────────────────────

function exportActivities() {
    if (activities.length === 0) {
        showMessage(formmessage, "There are no activities to export.", "info");
        return;
    }

    const json = JSON.stringify(activities, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "campus-activities.json";
    link.click();
    URL.revokeObjectURL(url);
}

function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function () {
        try {
            const importedData = JSON.parse(reader.result);

            if (!Array.isArray(importedData)) {
                showMessage(
                    document.getElementById("import-message"),
                    "Import failed. The file must contain a JSON array.",
                    "error"
                );
                return;
            }

            const errors = [];
            importedData.forEach((record, index) => {
                const recordErrors = validateRecord(record);
                if (recordErrors.length > 0) {
                    errors.push(`Item ${index + 1}: ${recordErrors[0]}`);
                }
            });

            if (errors.length > 0) {
                showMessage(
                    document.getElementById("import-message"),
                    "Import failed. " + errors.slice(0, 3).join(" "),
                    "error"
                );
                return;
            }

            const existingIds = new Set(activities.map((a) => a.id));
            let addedCount = 0;

            importedData.forEach((record) => {
                const copy = { ...record };
                if (existingIds.has(copy.id)) {
                    copy.id = generateId();
                }
                existingIds.add(copy.id);
                activities.push(copy);
                addedCount++;
            });

            saveActivities();
            renderAll();

            showMessage(
                document.getElementById("import-message"),
                `${addedCount} activities imported successfully.`,
                "success"
            );
        } catch (error) {
            showMessage(
                document.getElementById("import-message"),
                "Import failed. The file could not be parsed as JSON.",
                "error"
            );
        } finally {
            importfileinput.value = "";
        }
    };

    reader.onerror = function () {
        showMessage(
            document.getElementById("import-message"),
            "The file could not be read.",
            "error"
        );
    };

    reader.readAsText(file);
}

// ── SAMPLE DATA ──────────────────────────────────────────────────────────────

function loadSampleActivities() {
    const confirmed = window.confirm(
        "Add sample activities to your planner?"
    );
    if (!confirmed) return;

    const samples = [
        {
            title: "Python Study Session",
            category: "Study",
            date: "2026-10-15",
            time: "09:00",
            priority: "high",
            description: "Practise Python functions and loops.",
            status: "planned"
        },
        {
            title: "Database Assignment",
            category: "Assignment",
            date: "2026-10-15",
            time: "14:00",
            priority: "high",
            description: "Finish the database queries.",
            status: "planned"
        },
        {
            title: "Group Project Meeting",
            category: "Meeting",
            date: "2026-10-16",
            time: "10:00",
            priority: "medium",
            description: "Discuss project tasks with the group.",
            status: "planned"
        },
        {
            title: "Read Course Notes",
            category: "Study",
            date: "2026-10-17",
            time: "11:00",
            priority: "low",
            description: "Review the notes from class.",
            status: "planned"
        },
        {
            title: "Submit Essay",
            category: "Assignment",
            date: "2026-10-18",
            time: "16:00",
            priority: "high",
            description: "Check references before submitting.",
            status: "planned"
        },
        {
            title: "Football Practice",
            category: "Sports",
            date: "2026-10-19",
            time: "17:00",
            priority: "medium",
            description: "Attend campus football practice.",
            status: "planned"
        },
        {
            title: "Library Research",
            category: "Study",
            date: "2026-10-20",
            time: "13:00",
            priority: "medium",
            description: "Find sources for the next assignment.",
            status: "planned"
        },
        {
            title: "Career Workshop",
            category: "Career",
            date: "2026-10-21",
            time: "10:30",
            priority: "medium",
            description: "Learn about CVs and interviews.",
            status: "planned"
        },
        {
            title: "Club Planning Meeting",
            category: "Meeting",
            date: "2026-10-22",
            time: "15:00",
            priority: "low",
            description: "Plan activities for the campus club.",
            status: "planned"
        },
        {
            title: "Complete UI Project",
            category: "Assignment",
            date: "2026-10-23",
            time: "12:00",
            priority: "high",
            description: "Test the responsive website.",
            status: "completed"
        }
    ];

    const newSamples = samples.map((sample) => ({
        id: generateId(),
        ...sample,
        createdAt: new Date().toISOString()
    }));

    activities.push(...newSamples);
    saveActivities();
    renderAll();

    showMessage(
        formmessage,
        `${newSamples.length} sample activities added.`,
        "success"
    );
}

function clearAllActivities() {
    if (activities.length === 0) {
        showMessage(formmessage, "There are no activities to clear.", "info");
        return;
    }

    const confirmed = window.confirm(
        "This will permanently delete all activities. Continue?"
    );
    if (!confirmed) return;

    activities = [];
    saveActivities();
    resetFormFields();
    renderAll();

    showMessage(formmessage, "All activities have been deleted.", "success");
}

// ── RENDER ALL ───────────────────────────────────────────────────────────────

function renderAll() {
    renderActivities();
    renderStats();
    updateTargetDisplay();
}

// ── EVENT LISTENERS ──────────────────────────────────────────────────────────

function attachEventListeners() {
    activityform.addEventListener("submit", handleFormSubmit);

    resetFormButton.addEventListener("click", handleResetForm);

    activitylist.addEventListener("click", handleActivityListClick);

    if (searchinput) {
        searchinput.addEventListener("input", renderActivities);
    }

    if (sortselect) {
        sortselect.addEventListener("change", renderActivities);
    }

    if (savetarget) {
        savetarget.addEventListener("click", handleSaveTarget);
    }

    if (exportbutton) {
        exportbutton.addEventListener("click", exportActivities);
    }

    if (importbutton) {
        importbutton.addEventListener("click", () => {
            importfileinput.click();
        });
    }

    if (importfileinput) {
        importfileinput.addEventListener("change", handleImportFile);
    }

    if (loadsamplesButton) {
        loadsamplesButton.addEventListener("click", loadSampleActivities);
    }

    if (clearAllButton) {
        clearAllButton.addEventListener("click", clearAllActivities);
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener("click", handleDarkModeToggle);
    }
}

// ── INIT ─────────────────────────────────────────────────────────────────────

function initApp() {
    initDarkMode();
    loadActivities();
    attachEventListeners();
    renderAll();

    console.log("Campus Life Planner is ready!");
}

document.addEventListener("DOMContentLoaded", initApp);
