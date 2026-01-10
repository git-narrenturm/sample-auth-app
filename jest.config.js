export default {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Указываем корневую директорию
  rootDir: './',

  // Используем moduleDirectories для удобства
  moduleDirectories: ['node_modules', '<rootDir>/src'],

  // Маппинг путей для удобного импорта
  moduleNameMapper: {
    '^@entities/(.*)$': '<rootDir>/src/database/entities/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@auth/(.*)$': '<rootDir>/src/modules/auth/$1',
    '^@user/(.*)$': '<rootDir>/src/modules/user/$1',
  },

  // Трансформация файлов .ts с использованием ts-jest
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },

  // Используем testMatch вместо testRegex для большей читаемости
  testMatch: ['<rootDir>/src/test/**/*.(test|spec).ts'],

  // Игнорируем ненужные папки
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  // Указываем типы файлов, которые будут тестироваться
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Включаем сбор статистики покрытия
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/main.ts',  // Исключаем основной файл
  ],
  coverageDirectory: 'coverage',  // Указываем папку для покрытия
};
