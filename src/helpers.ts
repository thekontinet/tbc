export const env = (key:string, defaultValue = '') => {
    return process.env[key] ?? defaultValue
}