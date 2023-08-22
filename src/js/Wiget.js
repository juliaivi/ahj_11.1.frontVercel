import { ajax } from 'rxjs/ajax';
import {
  catchError, interval, of, take, map, concatMap,
} from 'rxjs';

import creatMessage from './creatMessage';
import errorMessage from './errorMessage';

export default class Widget {
  constructor() {
    this.container = document.querySelector('.container');
    // this.url = 'https://ahj-11-1.vercel.app/messages/unread';
    this.url = 'http://localhost:3000/messages/unread';
    this.subject = null;
    this.table = document.querySelector('table');
    this.tbody = document.querySelector('tbody');
    this.activeMess = null;
  }

  init() {
    this.tbody.addEventListener('click', (e) => this.onClick(e));
    this.subscribeToUpdate();
  }

  onClick(e) {
    const tr = e.target.closest('tr');
    this.dataId = tr.getAttribute('data-id');
    if (this.activeMess !== this.dataId) {
      if (this.activeMess !== null) {
        const activeElem = document.querySelector(`[data-id="${this.activeMess}"]`);
        activeElem.querySelector('.text').classList.remove('d__none');
        activeElem.querySelector('.long__text').classList.add('d__none');
      }

      tr.querySelector('.text').classList.add('d__none');
      tr.querySelector('.long__text').classList.remove('d__none');
      this.activeMess = this.dataId;
    } else {
      tr.querySelector('.text').classList.toggle('d__none');
      tr.querySelector('.long__text').classList.toggle('d__none');
    }
  }

  subscribeToUpdate() {
    let data = null;
    this.stream$ = interval(4000) // поток, через сколько нужно запускать
      .pipe( // позволяет производить манипуляции с потоком
        take(2), // получить 5 значений и поток завершится switchMap mergeMap
        concatMap(() => ajax.getJSON(this.url).pipe(// получение значения из фетча пярмо в потоке
          map((messages) => messages.messages), // достать значение чтоб в обзервере ничего не делать
          catchError((error) => { // принимает колбек и на выход т.к. предыдущий поток прерван, может вернуть новый
            console.log('error: ', error);
            if (!this.table.querySelector('.error')) {
              errorMessage();
            }

            return of(error); // генерируе ответ сами, вывожу ошибку
          }),
        )),
      )
      .subscribe((res) => { // подписаться на данный поток, получить некий результат (получить данные)
        data = res;
        if (data.length > 0) {
          this.tbody.replaceChildren();
          data.forEach((elem) => {
            if (elem.subject.length > 15) {
              this.shortenText(elem.subject);
            } else {
              this.subject = elem.subject;
            }
            creatMessage(elem.id, elem.from, this.subject, elem.subject, elem.body, elem.received);
          });
        }
      });
  }

  // проверяет длину текста
  shortenText(el) {
    this.subject = `${el.substr(0, 15)}...`;
  }
}
