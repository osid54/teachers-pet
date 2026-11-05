export function apiErrorMessage(error, fallback) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail.map(item => item.msg).filter(Boolean).join('; ') || fallback;
    return fallback;
}