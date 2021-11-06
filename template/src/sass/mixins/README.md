# mixins

Миксины для scss. Имена файлов для миксинов должны начинать с префикса **`m_`**

Пример:

Файл `m_layout.scss`

```scss
@mixin tablet {
  @media (min-width: (768px)) {
    @content;
  }
}

//...
```
