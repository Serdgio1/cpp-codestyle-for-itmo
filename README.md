# C++ Code Style for ITMO

Автоматическое расширение для VS Code, которое применяет правила Google C++ Style Guide для ITMO.

## Возможности

### Форматирование условий и блоков
- Конвертирует однострочные `if` в многострочный формат с фигурными скобками
- Оборачивает `if (...) continue;` и другие однострочные операторы в блоки
- Нормализует пробелы: `if()` → `if ()`, `){` → `) {`
- Правильно форматирует `else if` и `else` блоки

### Именование
- **Функции**: Автоматически приводит к UpperCamelCase (кроме `main`)
- **Структуры и классы**: Приводит к UpperCamelCase (`struct my_struct` → `struct MyStruct`)
- **Константы**:
  - Макросы (`#define`): UPPER_SNAKE_CASE
  - Глобальные/статические/constexpr: `k` + CamelCase (`const int max_size` → `const int kMaxSize`)
  - Локальные константы: camelCase (`const int MAX_SIZE` → `const int maxSize`)

### Автоматическое распространение изменений
- Все переименованные идентификаторы автоматически обновляются во всём файле
- Отслеживание и замена всех использований функций, структур, классов и констант
- Использование словаря для обеспечения консистентности переименований

### Форматирование кода
- Обрезает строки длиннее 120 символов с добавлением комментария
- Правильное форматирование отступов в блоках кода

## Горячие клавиши

- **Windows/Linux**: `Ctrl+Shift+L`
- **macOS**: `Cmd+Shift+L`

## Установка

1. Скачайте `.vsix` файл из репозитория или из секции Releases
2. В VS Code: `Extensions` → `...` → `Install from VSIX...`
3. Выберите скачанный файл `.vsix`
4. Перезапустите VS Code (при необходимости)

## Использование

1. Откройте любой C/C++ файл в VS Code
2. Нажмите горячие клавиши (`Ctrl+Shift+L` / `Cmd+Shift+L`)
3. Или вызовите команду через Command Palette: `Ctrl+Shift+P` → `Fix codestyle`

Расширение автоматически применит все правила стиля кода к текущему файлу и покажет уведомление с количеством переименованных элементов и применённых изменений.

## Примеры

### Переименование функций
```cpp
// До
void calculate_sum(int a, int b) { ... }
void process_data() { ... }

// После
void CalculateSum(int a, int b) { ... }
void ProcessData() { ... }
```

### Переименование структур и классов
```cpp
// До
struct student_data { ... };
class database_connection { ... };

// После
struct StudentData { ... };
class DatabaseConnection { ... };
```

### Переименование констант
```cpp
// До
#define max_size 100
const int MAX_VALUE = 100;
constexpr int SIZE = 50;
const int local_const = 10;

// После
#define MAX_SIZE 100
const int kMaxValue = 100;
constexpr int kSize = 50;
const int localConst = 10;
```

### Форматирование if-блоков
```cpp
// До
if (x > 0) doSomething();
if (condition) continue;

// После
if (x > 0) {
    doSomething();
}
if (condition) {
    continue;
}
```

