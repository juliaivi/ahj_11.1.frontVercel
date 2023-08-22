import creatsDate from './creatDate';

export default function creatMessage(id, mail, pieceText, subject, body, date) {
  const received = creatsDate(date);
  const tableTbody = document.querySelector('.table__tbody');
  const error = document.querySelector('.error');
  if (error) {
    error.remove();
  }
  const boxText = `
                  <tr class="message" data-id='${id}'>
                    <td class="mail">${mail}</td>
                    <td class="subject">
                      <span class="text">${pieceText}</span>
                      <span class="long__text d__none">${subject}\n ${body}</span>
                    </td>
                    <td class="date">${received}</td>
                  </tr> 
    `;

  tableTbody.insertAdjacentHTML('afterbegin', boxText);
}
