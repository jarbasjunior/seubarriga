test('Devo conhecer as principais assertivas do jest', () => {
  let number = null;
  expect(number).toBeNull();

  number = 10;
  expect(number).not.toBeNull();
  expect(number).toBe(10);
  expect(number).toEqual(10);
  expect(number).toBeGreaterThan(9);
  expect(number).toBeLessThan(11);
});

test('Devo saber trabalhar com objetos', () => {
  const obj = { name: 'user', mail: 'user@email.com' };

  expect(obj).toHaveProperty('name');
  expect(obj).toHaveProperty('name', 'user');
  expect(obj.name).toBe('user');

  const obj2 = { name: 'user', mail: 'user@email.com' };
  expect(obj).toEqual(obj2);
});

// para visualizar logs no database
// app.db.on('query', (query) => {
//   console.log({ sql: query.sql, bindings: query.bindings ? query.bindings.join(',') : '' });
// })
//   .on('query-response', (response) => console.log(response))
//   .on('error', (error) => console.log(error));
