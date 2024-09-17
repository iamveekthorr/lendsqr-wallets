// Skip Husky install in production and CI
if (process.env.NODE_ENV === 'production' || process.env.CI === 'true') {
  console.log('Skipping Husky install in production or CI.');
  return;
}
const husky = (await import('husky')).default;
console.log(husky());
