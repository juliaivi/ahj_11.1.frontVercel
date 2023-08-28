import { ajax } from 'rxjs/ajax';
import {
  catchError, interval, of, map, fromEvent, EMPTY, switchMap,
} from 'rxjs';

import creatMessage from './creatMessage';
import errorMessage from './errorMessage';

export default class Widget {
  constructor() {
    this.container = document.querySelector('.container');
    // this.url = 'https://ahj-11-1-backv2.onrender.com/messages/unread';
    this.url = 'http://localhost:3000/messages/unread';
    this.subject = null;
    this.table = document.querySelector('table');
    this.tbody = document.querySelector('tbody');
    this.activeMess = null;
  }

  init() {
    this.tbody.addEventListener('click', (e) => this.onClick(e));
    this.btnClick$ = fromEvent(document.querySelector('.container'), 'click'); // fromEvent Создает наблюдаемый объект, который генерирует события определенного типа, исходящие из заданной цели события.
    this.onClickBtn();
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

  subscribeStream() { // подписываемся на поток
    return ajax.getJSON(this.url).pipe(// отправляем запрос
      map((response) => response),
      catchError((error) => { // принимает колбек и на выход т.к. предыдущий поток прерван, может вернуть новый
        console.log('error: ', error);
        if (!this.table.querySelector('.error')) {
          errorMessage();
        }

        return of(); // генерируе ответ сам, можно выводить ошибку
      }),
    );
  }

  onClickBtn() {
    let subscribe = false;
    this.startClick$ = this.btnClick$.pipe( // создание потока когда щелкнула по нему. Меняет состояние кнопки и статуса
      map((e) => {
        const elem = e.target;
        if (elem.classList.contains('btn')) {
          if (elem.classList.contains('btn-subscribe')) {
            elem.classList.remove('btn-subscribe');
            elem.classList.add('btn-unsubscribe');
            elem.textContent = 'Отписаться';
            subscribe = true;
          } else {
            elem.classList.add('btn-subscribe');
            elem.classList.remove('btn-unsubscribe');
            elem.textContent = 'Подписаться';
            subscribe = false;
          }
        }
        return subscribe;
      }),
    );

    this.startClick$.pipe( // еще так можно останавливать поток takeUntil(this.stream$)
      switchMap((isStart) => (isStart ? interval(2000) : EMPTY)), // Простое наблюдаемое, которое выдает только полное уведомление. Его можно использовать для компоновки с другими наблюдаемыми, например, в mergeMap.
      // Простой наблюдаемый объект, который не передает наблюдателю никаких элементов и немедленно отправляет полное уведомление.
      switchMap(() => this.subscribeStream()),
    )
      .subscribe((response) => { // подписаться на данный поток, получить некий результат (получить данные)
        const data = response.messages;
        if (data.length > 0) {
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

  // сокращение слова
  shortenText(el) {
    this.subject = `${el.substr(0, 15)}...`;
  }
}
