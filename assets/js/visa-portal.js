const STORAGE_KEY = 'turboVisaProfiles';

const fieldDefinitions = [
    { id: 'profile-name', key: 'profileName', label: 'Data package name', required: true, maxLength: 80 },
    { id: 'first-name', key: 'firstName', label: 'First name', required: true, maxLength: 40 },
    { id: 'middle-name', key: 'middleName', label: 'Middle name', required: false, maxLength: 40 },
    { id: 'last-name', key: 'lastName', label: 'Last name', required: true, maxLength: 40 },
    { id: 'preferred-name', key: 'preferredName', label: 'Preferred name', required: false, maxLength: 40 },
    { id: 'dob', key: 'dob', label: 'Date of birth', required: true, type: 'date' },
    { id: 'country-of-birth', key: 'countryOfBirth', label: 'Country/Region of birth', required: true, maxLength: 60 },
    { id: 'nationality', key: 'nationality', label: 'Nationality', required: true, maxLength: 60 },
    { id: 'citizenship', key: 'citizenship', label: 'Citizenship', required: true, maxLength: 60 },
    { id: 'gender', key: 'gender', label: 'Gender', required: true },
    { id: 'marital-status', key: 'maritalStatus', label: 'Marital status', required: true },
    { id: 'ssn', key: 'ssn', label: 'Social Security number', required: false, pattern: /^\d{3}-\d{2}-\d{4}$/, patternMessage: 'Use the format 123-45-6789.' },
    { id: 'phone-number', key: 'phoneNumber', label: 'Primary phone number', required: true, pattern: /^\+?[0-9\s().-]{7,20}$/, patternMessage: 'Enter a valid phone number.' },
    { id: 'email', key: 'email', label: 'Primary email', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, patternMessage: 'Enter a valid email address.' },
    { id: 'passport-num', key: 'passportNumber', label: 'Passport number', required: true, pattern: /^[A-Za-z0-9]{5,20}$/, patternMessage: 'Passport numbers must be 5-20 letters or digits.' },
    { id: 'passport-issuing-country', key: 'passportIssuingCountry', label: 'Passport issuing country', required: true, maxLength: 60 },
    { id: 'passport-issue-date', key: 'passportIssueDate', label: 'Passport issue date', required: true, type: 'date' },
    { id: 'passport-expiry', key: 'passportExpiry', label: 'Passport expiry date', required: true, type: 'date' },
    { id: 'has-previous-visa', key: 'hasPreviousVisa', label: 'Previous U.S. visa', required: true },
    { id: 'last-visa-type', key: 'lastVisaType', label: 'Most recent visa type', required: false, maxLength: 60 },
    { id: 'travel-purpose', key: 'travelPurpose', label: 'Primary purpose of travel', required: true },
    { id: 'intended-duration', key: 'intendedDuration', label: 'Intended stay duration', required: true, pattern: /^(?:[1-9]\d?|[12]\d{2})$/, patternMessage: 'Provide a value between 1 and 299.' },
    { id: 'arrival-date', key: 'arrivalDate', label: 'Intended arrival date', required: false, type: 'date' },
    { id: 'us-address-line1', key: 'usAddressLine1', label: 'U.S. address line 1', required: true, maxLength: 80 },
    { id: 'us-address-line2', key: 'usAddressLine2', label: 'U.S. address line 2', required: false, maxLength: 80 },
    { id: 'us-city', key: 'usCity', label: 'U.S. city', required: true, maxLength: 60 },
    { id: 'us-state', key: 'usState', label: 'U.S. state', required: true, maxLength: 40 },
    { id: 'us-zip', key: 'usPostalCode', label: 'U.S. postal code', required: true, pattern: /^\d{5}(?:-\d{4})?$/, patternMessage: 'Use the format 12345 or 12345-6789.' },
    { id: 'notes', key: 'notes', label: 'Internal notes', required: false, maxLength: 800 },
    { id: 'allow-data-sharing', key: 'allowDataSharing', label: 'Data sharing consent', required: false, type: 'checkbox' }
];

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('visa-data-form');
    if (!form) {
        console.error('TurboVisa: form element with id "visa-data-form" not found.');
        return;
    }

    const profileSelect = document.getElementById('profile-selector');
    const createProfileButton = document.getElementById('create-profile');
    const saveProfileButton = document.getElementById('save-profile');
    const duplicateProfileButton = document.getElementById('duplicate-profile');
    const deleteProfileButton = document.getElementById('delete-profile');
    const downloadJsonButton = document.getElementById('download-json');
    const pdfButton = document.getElementById('fill-download-pdf');
    const historyList = document.getElementById('profile-history');
    const profileCountEl = document.getElementById('profile-count');
    const lastSavedEl = document.getElementById('last-saved-at');
    const autosaveIndicator = document.getElementById('autosave-indicator');
    const alertBanner = document.getElementById('form-alert');
    const toastContainer = document.getElementById('toast-container');

    const state = {
        profiles: [],
        selectedProfileId: null,
        isDirty: false
    };

    let storageAvailable = true;
    let storageWarningShown = false;
    let inMemoryProfiles = [];
    let pdfLibLoader = null;

    initialize();

    /* Event bindings */
    if (profileSelect) {
        profileSelect.addEventListener('change', handleProfileChange);
    }

    form.addEventListener('submit', handleConfirmNext);
    form.addEventListener('input', handleFormInput);
    form.addEventListener('change', handleFormChange);

    if (createProfileButton) {
        createProfileButton.addEventListener('click', startNewProfile);
    }
    if (saveProfileButton) {
        saveProfileButton.addEventListener('click', () => handleSaveProfile());
    }
    if (duplicateProfileButton) {
        duplicateProfileButton.addEventListener('click', duplicateCurrentProfile);
    }
    if (deleteProfileButton) {
        deleteProfileButton.addEventListener('click', deleteCurrentProfile);
    }
    if (downloadJsonButton) {
        downloadJsonButton.addEventListener('click', handleJsonExport);
    }
    if (pdfButton) {
        pdfButton.addEventListener('click', handlePdfExport);
    }
    if (historyList) {
        historyList.addEventListener('click', (event) => {
            const trigger = event.target.closest('[data-load-profile]');
            if (!trigger) {
                return;
            }
            const profileId = trigger.getAttribute('data-load-profile');
            if (profileId) {
                profileSelect.value = profileId;
                profileSelect.dispatchEvent(new Event('change', { bubbles: true }));
                trigger.blur();
            }
        });
    }

    window.addEventListener('beforeunload', (event) => {
        if (state.isDirty) {
            event.preventDefault();
            event.returnValue = '';
        }
    });

    /* Initialization */
    function initialize() {
        state.profiles = readProfilesFromStorage();
        const sorted = getProfilesSorted();
        state.selectedProfileId = sorted.length ? sorted[0].id : null;

        populateProfileSelector(sorted);
        if (state.selectedProfileId) {
            const active = getSelectedProfile();
            if (active) {
                applyFormData(active.data);
                updateProfileSummaryMeta(active);
            }
        } else {
            applyFormData(createEmptyProfileData());
            updateProfileSummaryMeta(null);
        }

        updateHistory(sorted);
        clearAllFieldErrors();
        setDirty(false);
        toggleLastVisaField(form.elements['has-previous-visa']?.value || '');
    }

    /* Event Handlers */
    function handleProfileChange(event) {
        const selectedId = event.target.value;
        if (selectedId === '__new__') {
            startNewProfile();
            return;
        }

        const profile = state.profiles.find((item) => item.id === selectedId);
        if (!profile) {
            showAlert('Selected data package could not be found. It may have been removed.', 'warning');
            state.selectedProfileId = null;
            setDirty(false);
            return;
        }

        state.selectedProfileId = profile.id;
        applyFormData(profile.data);
        clearAllFieldErrors();
        toggleLastVisaField(form.elements['has-previous-visa']?.value || '');
        setDirty(false);
        updateProfileSummaryMeta(profile);
        showToast(`Loaded data package "${profile.data.profileName || 'Untitled package'}".`, 'info');
        clearAlert();
    }

    function handleFormInput(event) {
        const target = event.target;
        if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) {
            return;
        }

        if (target.id === 'has-previous-visa') {
            toggleLastVisaField(target.value);
        }

        setDirty(true);
        const data = getFormData();
        const errors = validateData(data);
        showValidationErrors(errors);
        if (Object.keys(errors).length === 0) {
            clearAlert();
        }
    }

    function handleFormChange(event) {
        const target = event.target;
        if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) {
            return;
        }
        if (target.type === 'date' || target.type === 'number') {
            const data = getFormData();
            const errors = validateData(data);
            showValidationErrors(errors);
        }
    }

    function handleConfirmNext(event) {
        event.preventDefault();
        const data = getFormData();
        const errors = validateData(data);
        const hasErrors = showValidationErrors(errors);
        if (hasErrors) {
            showAlert('Please resolve the highlighted fields before continuing to the next step.', 'error');
            return;
        }
        clearAlert();
        showToast('Applicant data validated. You are ready for the next workflow step.', 'success');
    }

    function handleSaveProfile() {
        const data = getFormData();
        const errors = validateData(data);
        const hasErrors = showValidationErrors(errors);
        if (hasErrors) {
            showAlert('Please correct the highlighted fields before saving the data package.', 'error');
            return false;
        }

        clearAlert();
        const now = new Date().toISOString();

        if (state.selectedProfileId) {
            const index = state.profiles.findIndex((profile) => profile.id === state.selectedProfileId);
            if (index >= 0) {
                const updatedProfile = {
                    ...state.profiles[index],
                    data,
                    updatedAt: now
                };
                state.profiles.splice(index, 1, updatedProfile);
            } else {
                const fallbackProfile = {
                    id: state.selectedProfileId,
                    data,
                    createdAt: now,
                    updatedAt: now
                };
                state.profiles.push(fallbackProfile);
            }
        } else {
            const newId = createUniqueId();
            const newProfile = {
                id: newId,
                data,
                createdAt: now,
                updatedAt: now
            };
            state.profiles.push(newProfile);
            state.selectedProfileId = newId;
        }

        const writeOk = writeProfilesToStorage(state.profiles);
        populateProfileSelector();
        updateHistory();
        const selectedProfile = getSelectedProfile();
        updateProfileSummaryMeta(selectedProfile || null);
        setDirty(false);
        showToast('Data package saved successfully.', 'success');

        if (!writeOk && !storageWarningShown) {
            showAlert('Browser storage is not available. Data will only persist for this session.', 'warning');
            storageWarningShown = true;
        }

        return true;
    }

    function startNewProfile() {
        state.selectedProfileId = null;
        applyFormData(createEmptyProfileData());
        clearAllFieldErrors();
        setDirty(false);
        updateProfileSummaryMeta(null);
        if (profileSelect) {
            profileSelect.value = '__new__';
        }
        toggleLastVisaField('');
        showToast('Started a new data package.', 'info');
        clearAlert();
    }

    function duplicateCurrentProfile() {
        const profile = getSelectedProfile();
        if (!profile) {
            showAlert('Save the current data package before duplicating it.', 'warning');
            return;
        }

        const now = new Date().toISOString();
        const duplicatedData = { ...profile.data };
        duplicatedData.profileName = generateDuplicateName(profile.data.profileName);

        const duplicateProfile = {
            id: createUniqueId(),
            data: duplicatedData,
            createdAt: now,
            updatedAt: now
        };

        state.profiles.push(duplicateProfile);
        writeProfilesToStorage(state.profiles);
        state.selectedProfileId = duplicateProfile.id;
        populateProfileSelector();
        updateHistory();
        applyFormData(duplicateProfile.data);
        toggleLastVisaField(form.elements['has-previous-visa']?.value || '');
        updateProfileSummaryMeta(duplicateProfile);
        setDirty(false);
        showToast('Data package duplicated.', 'success');
        clearAlert();
    }

    function deleteCurrentProfile() {
        const profile = getSelectedProfile();
        if (!profile) {
            showAlert('Select a saved data package to delete.', 'warning');
            return;
        }

        const confirmation = window.confirm(`Delete the data package "${profile.data.profileName || 'Untitled package'}"? This action cannot be undone.`);
        if (!confirmation) {
            return;
        }

        state.profiles = state.profiles.filter((item) => item.id !== profile.id);
        writeProfilesToStorage(state.profiles);

        const remaining = getProfilesSorted();
        state.selectedProfileId = remaining.length ? remaining[0].id : null;

        if (state.selectedProfileId) {
            const nextProfile = state.profiles.find((item) => item.id === state.selectedProfileId);
            applyFormData(nextProfile?.data || createEmptyProfileData());
            updateProfileSummaryMeta(nextProfile || null);
        } else {
            applyFormData(createEmptyProfileData());
            updateProfileSummaryMeta(null);
        }

        populateProfileSelector();
        updateHistory();
        toggleLastVisaField(form.elements['has-previous-visa']?.value || '');
        clearAllFieldErrors();
        setDirty(false);
        showToast('Data package deleted.', 'info');
        clearAlert();
    }

    function handleJsonExport() {
        const data = getFormData();
        const errors = validateData(data);
        const hasErrors = showValidationErrors(errors);
        if (hasErrors) {
            showAlert('Fix validation issues before exporting JSON.', 'error');
            return;
        }
        clearAlert();

        const payload = {
            exportedAt: new Date().toISOString(),
            profileId: state.selectedProfileId,
            profileName: data.profileName,
            application: data
        };

        const fileName = generateFileName(data.profileName || 'visa-data', 'json');
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        downloadBlob(blob, fileName);
        showToast('Data package exported as JSON.', 'success');
    }

    async function handlePdfExport() {
        const data = getFormData();
        const errors = validateData(data);
        const hasErrors = showValidationErrors(errors);
        if (hasErrors) {
            showAlert('Resolve validation issues before generating a PDF summary.', 'error');
            return;
        }
        clearAlert();

        try {
            await exportProfileToPdf({
                id: state.selectedProfileId,
                data
            });
            showToast('PDF summary generated successfully.', 'success');
        } catch (error) {
            console.error('TurboVisa: failed to create PDF summary.', error);
            showAlert('Unable to generate PDF summary. Please try again.', 'error');
        }
    }

    /* State & Storage Helpers */
    function getFormData() {
        const data = {};
        for (const field of fieldDefinitions) {
            const control = form.elements[field.id];
            if (!control) {
                continue;
            }

            if (control instanceof HTMLInputElement) {
                if (control.type === 'checkbox') {
                    data[field.key] = control.checked;
                } else {
                    data[field.key] = control.value.trim();
                }
            } else if (control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement) {
                data[field.key] = control.value.trim();
            }
        }
        return data;
    }

    function applyFormData(data) {
        form.reset();
        for (const field of fieldDefinitions) {
            const control = form.elements[field.id];
            if (!control) {
                continue;
            }
            const value = data ? data[field.key] : '';

            if (control instanceof HTMLInputElement) {
                if (control.type === 'checkbox') {
                    control.checked = Boolean(value);
                } else if (control.type === 'date') {
                    control.value = value || '';
                } else if (control.type === 'number') {
                    control.value = value || '';
                } else {
                    control.value = value || '';
                }
            } else if (control instanceof HTMLSelectElement) {
                control.value = value || '';
            } else if (control instanceof HTMLTextAreaElement) {
                control.value = value || '';
            }
        }
    }

    function createEmptyProfileData() {
        const empty = {};
        for (const field of fieldDefinitions) {
            if (field.type === 'checkbox') {
                empty[field.key] = false;
            } else {
                empty[field.key] = '';
            }
        }
        return empty;
    }

    function getProfilesSorted() {
        return [...state.profiles].sort((a, b) => {
            const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
            const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
            return bTime - aTime;
        });
    }

    function getSelectedProfile() {
        if (!state.selectedProfileId) {
            return null;
        }
        return state.profiles.find((profile) => profile.id === state.selectedProfileId) || null;
    }

    function populateProfileSelector(sortedProfiles) {
        if (!profileSelect) {
            return;
        }
        const profiles = sortedProfiles || getProfilesSorted();
        profileSelect.innerHTML = '';

        const createOption = document.createElement('option');
        createOption.value = '__new__';
        createOption.textContent = 'Create new data package';
        profileSelect.appendChild(createOption);

        for (const profile of profiles) {
            const option = document.createElement('option');
            option.value = profile.id;
            option.textContent = profile.data?.profileName || 'Untitled package';
            profileSelect.appendChild(option);
        }

        profileSelect.value = state.selectedProfileId || '__new__';
    }

    function updateHistory(sortedProfiles) {
        if (!historyList) {
            return;
        }
        const profiles = sortedProfiles || getProfilesSorted();
        historyList.innerHTML = '';

        if (!profiles.length) {
            const emptyState = document.createElement('li');
            emptyState.className = 'empty-state';
            emptyState.textContent = 'No saved data packages yet. Save a package to build your reusable workspace.';
            historyList.appendChild(emptyState);
            return;
        }

        for (const profile of profiles) {
            const item = document.createElement('li');
            item.className = 'history-item';

            const title = document.createElement('p');
            title.className = 'history-title';
            title.textContent = profile.data?.profileName || 'Untitled package';

            const meta = document.createElement('p');
            meta.className = 'history-meta';
            meta.textContent = `Updated ${formatTimestamp(profile.updatedAt || profile.createdAt)}`;

            const loadButton = document.createElement('button');
            loadButton.type = 'button';
            loadButton.className = 'history-load';
            loadButton.setAttribute('data-load-profile', profile.id);
            loadButton.textContent = 'Load';

            item.appendChild(title);
            item.appendChild(meta);
            item.appendChild(loadButton);

            historyList.appendChild(item);
        }
    }

    function readProfilesFromStorage() {
        if (!storageAvailable) {
            return [...inMemoryProfiles];
        }
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                inMemoryProfiles = [];
                return [];
            }
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) {
                return [];
            }
            const sanitized = parsed.map(sanitizeProfile).filter(Boolean);
            inMemoryProfiles = sanitized.map((profile) => ({ ...profile, data: { ...profile.data } }));
            return sanitized;
        } catch (error) {
            console.warn('TurboVisa: unable to access local storage. Falling back to in-memory storage.', error);
            storageAvailable = false;
            if (!storageWarningShown) {
                showAlert('Unable to access browser storage. Data will persist only for this session.', 'warning');
                storageWarningShown = true;
            }
            return [...inMemoryProfiles];
        }
    }

    function writeProfilesToStorage(profiles) {
        const prepared = profiles.map(prepareProfileForPersistence);
        inMemoryProfiles = prepared.map((profile) => ({ ...profile, data: { ...profile.data } }));
        if (!storageAvailable) {
            return false;
        }
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(prepared));
            return true;
        } catch (error) {
            console.warn('TurboVisa: failed to write to local storage. Falling back to in-memory storage.', error);
            storageAvailable = false;
            if (!storageWarningShown) {
                showAlert('Browser storage is not available. Data will only persist for this session.', 'warning');
                storageWarningShown = true;
            }
            return false;
        }
    }

    function sanitizeProfile(rawProfile) {
        if (!rawProfile || typeof rawProfile !== 'object') {
            return null;
        }
        const id = typeof rawProfile.id === 'string' ? rawProfile.id : null;
        if (!id) {
            return null;
        }
        const createdAt = typeof rawProfile.createdAt === 'string' ? rawProfile.createdAt : new Date().toISOString();
        const updatedAt = typeof rawProfile.updatedAt === 'string' ? rawProfile.updatedAt : createdAt;
        const data = {};

        for (const field of fieldDefinitions) {
            const rawValue = rawProfile.data ? rawProfile.data[field.key] : undefined;
            if (field.type === 'checkbox') {
                data[field.key] = Boolean(rawValue);
            } else {
                data[field.key] = rawValue == null ? '' : String(rawValue);
            }
        }

        return { id, createdAt, updatedAt, data };
    }

    function prepareProfileForPersistence(profile) {
        const preparedData = {};
        for (const field of fieldDefinitions) {
            const value = profile.data?.[field.key];
            if (field.type === 'checkbox') {
                preparedData[field.key] = Boolean(value);
            } else {
                preparedData[field.key] = value == null ? '' : String(value);
            }
        }
        return {
            id: profile.id,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
            data: preparedData
        };
    }

    /* Validation */
    function validateData(data) {
        const errors = {};
        const now = new Date();

        for (const field of fieldDefinitions) {
            const value = data[field.key];
            if (field.required) {
                if (field.type === 'checkbox') {
                    if (!value) {
                        errors[field.id] = `${field.label} must be checked.`;
                        continue;
                    }
                } else if (!value) {
                    errors[field.id] = `${field.label} is required.`;
                    continue;
                }
            }

            if (!value) {
                continue;
            }

            if (field.pattern && typeof value === 'string' && !field.pattern.test(value)) {
                errors[field.id] = field.patternMessage || `${field.label} is invalid.`;
                continue;
            }

            if (field.type === 'date') {
                const dateValue = parseDate(value);
                if (!dateValue) {
                    errors[field.id] = `${field.label} must be a valid date.`;
                    continue;
                }
                if (field.id === 'dob') {
                    if (dateValue > now) {
                        errors[field.id] = 'Date of birth cannot be in the future.';
                        continue;
                    }
                    const age = calculateAge(dateValue, now);
                    if (age < 14) {
                        errors[field.id] = 'Applicant must be at least 14 years old.';
                    } else if (age > 120) {
                        errors[field.id] = 'Please verify the date of birth.';
                    }
                }
                if (field.id === 'passport-issue-date' && dateValue > now) {
                    errors[field.id] = 'Passport issue date cannot be in the future.';
                }
                if (field.id === 'passport-expiry') {
                    const issueDateValue = data.passportIssueDate ? parseDate(data.passportIssueDate) : null;
                    if (dateValue <= now) {
                        errors[field.id] = 'Passport expiry date must be in the future.';
                    } else if (issueDateValue && dateValue <= issueDateValue) {
                        errors[field.id] = 'Passport expiry must be after the issue date.';
                    }
                }
                if (field.id === 'arrival-date' && dateValue <= now) {
                    errors[field.id] = 'Arrival date should be in the future.';
                }
            }

            if (field.id === 'intended-duration') {
                const months = Number(value);
                if (!Number.isInteger(months) || months < 1 || months > 299) {
                    errors[field.id] = 'Enter a duration between 1 and 299 months.';
                }
            }
        }

        if (data.hasPreviousVisa === 'Yes' && !data.lastVisaType) {
            errors['last-visa-type'] = 'Provide the most recent visa type.';
        }

        return errors;
    }

    function showValidationErrors(errorMap) {
        let hasErrors = false;
        for (const field of fieldDefinitions) {
            const message = errorMap[field.id] || '';
            setFieldError(field.id, message);
            if (message) {
                hasErrors = true;
            }
        }
        return hasErrors;
    }

    function clearAllFieldErrors() {
        for (const field of fieldDefinitions) {
            setFieldError(field.id, '');
        }
    }

    function setFieldError(fieldId, message) {
        const wrapper = form.querySelector(`[data-field="${fieldId}"]`);
        const errorElement = form.querySelector(`[data-error-for="${fieldId}"]`);
        const control = form.elements[fieldId];

        if (wrapper) {
            wrapper.classList.toggle('has-error', Boolean(message));
        }
        if (errorElement) {
            errorElement.textContent = message;
            if (message) {
                errorElement.hidden = false;
            } else {
                errorElement.hidden = true;
            }
        }
        if (control && control instanceof HTMLElement) {
            if (message) {
                control.setAttribute('aria-invalid', 'true');
            } else {
                control.removeAttribute('aria-invalid');
            }
        }
    }

    /* UI State Helpers */
    function updateProfileSummaryMeta(profile) {
        if (profileCountEl) {
            profileCountEl.textContent = String(state.profiles.length);
        }
        if (lastSavedEl) {
            if (profile?.updatedAt) {
                lastSavedEl.textContent = `Last saved ${formatTimestamp(profile.updatedAt)}`;
            } else {
                lastSavedEl.textContent = 'Not saved yet';
            }
        }
    }

    function setDirty(isDirty) {
        state.isDirty = isDirty;
        if (!autosaveIndicator) {
            return;
        }
        if (isDirty) {
            autosaveIndicator.textContent = 'Unsaved changes';
            autosaveIndicator.classList.add('status-warning');
        } else {
            autosaveIndicator.textContent = 'All changes saved';
            autosaveIndicator.classList.remove('status-warning');
        }
    }

    function toggleLastVisaField(value) {
        const fieldWrapper = form.querySelector('[data-field="last-visa-type"]');
        const control = form.elements['last-visa-type'];
        if (!fieldWrapper || !(control instanceof HTMLInputElement)) {
            return;
        }
        if (String(value).toLowerCase() === 'yes') {
            control.disabled = false;
            fieldWrapper.classList.remove('is-disabled');
        } else {
            control.disabled = true;
            control.value = '';
            fieldWrapper.classList.add('is-disabled');
            setFieldError('last-visa-type', '');
        }
    }

    function showAlert(message, variant = 'info') {
        if (!alertBanner) {
            return;
        }
        alertBanner.textContent = message;
        alertBanner.className = `alert-banner is-${variant}`;
        alertBanner.hidden = false;
    }

    function clearAlert() {
        if (!alertBanner) {
            return;
        }
        alertBanner.textContent = '';
        alertBanner.hidden = true;
        alertBanner.className = 'alert-banner';
    }

    function showToast(message, variant = 'success') {
        if (!toastContainer) {
            return;
        }
        const toast = document.createElement('div');
        toast.className = `toast toast-${variant}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('is-visible');
        });

        const maxToasts = 3;
        while (toastContainer.children.length > maxToasts) {
            toastContainer.removeChild(toastContainer.firstElementChild);
        }

        setTimeout(() => {
            toast.classList.remove('is-visible');
            toast.addEventListener(
                'transitionend',
                () => {
                    toast.remove();
                },
                { once: true }
            );
        }, 4200);
    }

    /* Export helpers */
    async function exportProfileToPdf(profile) {
        const pdfLib = await ensurePdfLib();
        if (!pdfLib) {
            throw new Error('PDFLib failed to load.');
        }

        const { PDFDocument, StandardFonts, rgb } = pdfLib;
        const pdfDoc = await PDFDocument.create();
        const pageSize = [612, 792]; // Letter
        let page = pdfDoc.addPage(pageSize);
        const { width, height } = page.getSize();
        const margin = 54;
        let cursorY = height - margin;

        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const textSize = 11;
        const lineHeight = 16;

        const addPage = () => {
            page = pdfDoc.addPage(pageSize);
            cursorY = height - margin;
        };

        const drawHeading = (text) => {
            if (cursorY < margin + 40) {
                addPage();
            }
            page.drawText(text, {
                x: margin,
                y: cursorY,
                size: 18,
                font: fontBold,
                color: rgb(0.16, 0.19, 0.25)
            });
            cursorY -= 28;
        };

        const wrapText = (text, maxWidth) => {
            if (!text) {
                return ['—'];
            }
            const words = String(text).split(/\s+/);
            const lines = [];
            let currentLine = '';

            for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const widthOfTestLine = fontRegular.widthOfTextAtSize(testLine, textSize);
                if (widthOfTestLine <= maxWidth || !currentLine) {
                    currentLine = testLine;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            if (currentLine) {
                lines.push(currentLine);
            }
            return lines.length ? lines : ['—'];
        };

        const drawKeyValue = (key, value) => {
            if (cursorY < margin + lineHeight * 2) {
                addPage();
            }
            page.drawText(key, {
                x: margin,
                y: cursorY,
                size: textSize,
                font: fontBold,
                color: rgb(0.16, 0.19, 0.25)
            });

            const wrapped = wrapText(value, width - margin * 2 - 160);
            let textY = cursorY;

            for (const [index, line] of wrapped.entries()) {
                if (textY < margin + lineHeight) {
                    addPage();
                    textY = cursorY;
                }
                page.drawText(line, {
                    x: margin + 160,
                    y: textY,
                    size: textSize,
                    font: fontRegular,
                    color: rgb(0.16, 0.19, 0.25)
                });
                textY -= lineHeight;
                cursorY = textY;
            }
            cursorY -= lineHeight / 2;
        };

        const fullName = [profile.data.firstName, profile.data.middleName, profile.data.lastName]
            .filter(Boolean)
            .join(' ');
        const profileName = profile.data.profileName || 'Untitled data package';

        drawHeading('TurboVisa — Applicant Summary');
        drawKeyValue('Data package', profileName);
        drawKeyValue('Applicant name', fullName || '—');
        drawKeyValue('Date of birth', profile.data.dob || '—');
        drawKeyValue('Nationality', profile.data.nationality || '—');
        drawKeyValue('Citizenship', profile.data.citizenship || '—');
        drawKeyValue('Passport number', profile.data.passportNumber || '—');
        drawKeyValue('Passport issuing country', profile.data.passportIssuingCountry || '—');
        drawKeyValue('Passport issue date', profile.data.passportIssueDate || '—');
        drawKeyValue('Passport expiry date', profile.data.passportExpiry || '—');
        drawKeyValue('Has previous U.S. visa', profile.data.hasPreviousVisa || '—');
        drawKeyValue('Most recent visa type', profile.data.lastVisaType || '—');
        drawKeyValue('Primary purpose of travel', profile.data.travelPurpose || '—');
        drawKeyValue('Intended stay duration (months)', profile.data.intendedDuration || '—');
        drawKeyValue('Intended arrival date', profile.data.arrivalDate || '—');

        drawHeading('Contact Information');
        drawKeyValue('Primary phone number', profile.data.phoneNumber || '—');
        drawKeyValue('Primary email', profile.data.email || '—');
        const addressLines = [
            profile.data.usAddressLine1,
            profile.data.usAddressLine2,
            [profile.data.usCity, profile.data.usState, profile.data.usPostalCode].filter(Boolean).join(', ')
        ]
            .filter(Boolean)
            .join('\n');
        drawKeyValue('U.S. address', addressLines || '—');

        drawHeading('Internal Notes');
        drawKeyValue('Notes', profile.data.notes || '—');
        drawKeyValue('Data sharing consent', profile.data.allowDataSharing ? 'Granted' : 'Not granted');

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const fileName = generateFileName(profileName || 'visa-data', 'pdf');
        downloadBlob(blob, fileName);
    }

    function downloadBlob(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    }

    async function ensurePdfLib() {
        if (window.PDFLib) {
            return window.PDFLib;
        }
        if (!pdfLibLoader) {
            pdfLibLoader = new Promise((resolve, reject) => {
                const existingScript = document.querySelector('script[data-pdf-lib="true"]');
                if (existingScript) {
                    existingScript.addEventListener('load', () => resolve(window.PDFLib));
                    existingScript.addEventListener('error', () => reject(new Error('Failed to load PDF library')));
                    return;
                }
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';
                script.async = true;
                script.defer = true;
                script.dataset.pdfLib = 'true';
                script.onload = () => resolve(window.PDFLib);
                script.onerror = () => reject(new Error('Failed to load PDF library'));
                document.head.appendChild(script);
            });
        }
        return pdfLibLoader;
    }

    /* Utility helpers */
    function parseDate(value) {
        if (!value) {
            return null;
        }
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    function calculateAge(birthDate, referenceDate) {
        let age = referenceDate.getFullYear() - birthDate.getFullYear();
        const monthDiff = referenceDate.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
            age -= 1;
        }
        return age;
    }

    function formatTimestamp(isoDate) {
        if (!isoDate) {
            return 'Not saved yet';
        }
        const date = new Date(isoDate);
        if (Number.isNaN(date.getTime())) {
            return 'Unknown';
        }
        return new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(date);
    }

    function createUniqueId() {
        if (window.crypto?.randomUUID) {
            return window.crypto.randomUUID();
        }
        return `profile-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
    }

    function generateDuplicateName(originalName) {
        const baseName = originalName ? originalName.trim() : 'Untitled package';
        const copySuffix = /(copy\s*\d*)$/i;
        if (copySuffix.test(baseName)) {
            const updated = baseName.replace(copySuffix, (match) => {
                const number = parseInt(match.replace(/\D/g, ''), 10);
                const nextNumber = Number.isNaN(number) ? 2 : number + 1;
                return `copy ${nextNumber}`;
            });
            return updated;
        }
        return `${baseName} (copy)`;
    }

    function generateFileName(base, extension) {
        const sanitized = base
            .toLowerCase()
            .replace(/[^a-z0-9]+/gi, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/-{2,}/g, '-')
            .slice(0, 60) || 'visa-data';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        return `${sanitized}-${timestamp}.${extension}`;
    }
});