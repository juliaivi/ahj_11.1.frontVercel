export default function errorMessage() {
  const tableTbody = document.querySelector('table');
  const boxText = `
                  <span class="error">Сообщений больше нет!</span>
    `;
  tableTbody.insertAdjacentHTML('afterbegin', boxText);
}
