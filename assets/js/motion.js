const STORAGE_KEY = 'ecf-motion';
const DISABLED = 'off';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const listeners = new Set();

function readStored() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(value) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, value);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
}

let userDisabled = readStored() === DISABLED;

function notify() {
  document.documentElement.classList.toggle('motion-off', !isMotionAllowed());
  listeners.forEach((listener) => listener());
}

export function isMotionAllowed() {
  return !reducedMotion.matches && !userDisabled;
}

export function isReducedMotion() {
  return reducedMotion.matches;
}

export function isUserDisabled() {
  return userDisabled;
}

export function setUserDisabled(disabled) {
  userDisabled = disabled;
  writeStored(disabled ? DISABLED : null);
  notify();
}

export function onMotionPreferenceChange(listener) {
  listeners.add(listener);
}

reducedMotion.addEventListener('change', notify);
document.documentElement.classList.toggle('motion-off', !isMotionAllowed());
