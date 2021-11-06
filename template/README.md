# template

Создание разметки и стилей. Все html-файлы страниц подключаются в [**index.html**](./src/index.html) в виде списка с ссылками:

```html
<body>
  <ul>
    <li><a href="page1.html">Page 1</a></li>
    <li><a href="page2.html">Page 2</a></li>
    <li><a href="page3.html">Page 3</a></li>
  </ul>
</body>
```

После чего готовые страницы, папки **styles** и **assets** нужно копировать из папки [**build**](./build/) в папку [**markup**](../markup).
