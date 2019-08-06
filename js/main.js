// mvc


class CookieData {
    constructor() {}

    set( name, value, exp_y, exp_m, exp_d, path, domain, secure ) {
        let cookie_string = name + "=" + escape ( value );

        if ( exp_y )
        {
            var expires = new Date ( exp_y, exp_m, exp_d );
            cookie_string += "; expires=" + expires.toGMTString();
        }

        if ( path )
            cookie_string += "; path=" + escape ( path );

        if ( domain )
            cookie_string += "; domain=" + escape ( domain );

        if ( secure )
            cookie_string += "; secure";

        document.cookie = cookie_string;
    }

    get(cookie_name) {
        const results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );

        if ( results )
            return ( unescape ( results[2] ) );
        else
            return null;
    }

    delete(cookie_name) {
        var cookie_date = new Date ( );  // Текущая дата и время

        cookie_date.setTime ( cookie_date.getTime() - 1 );
        document.cookie = cookie_name += "=; expires=" + cookie_date.toGMTString();
    }


}

const cookie_data = new CookieData();



class JokeModel {
    constructor() {
       this.inputValue = '';
    }

    requestJoke(URL, callback) {
        request("get", URL)
            .getBody('utf8')
            .then(JSON.parse)
            .done(body => {
                if (!body) {
                           callback('Unable to connect to api.icndb.com');
                } else if (body.type === 'success') {
                           callback(null, body.value)
                }
            })
    }

    removeNorries(joke) {
        return joke.replace('Norris', '');
    }

    validateText(name) {
        return name.length > 0 && /^[a-zA-Z][a-zA-Z_\.]{1,20}$/.test(name);
    }

    setValueInput(name) {
        this.inputValue = name;
    }

    getValueInput() {
        return this.inputValue;
    }
}


class JokeView {
    constructor(model) {
       this.text = document.getElementById("name");
       this.checkbox = document.getElementById("checkbox");
       this.submit = document.getElementById("submit");
       this.container = document.querySelector(".container-result")

       this._model = model;
    }

    addJoke(joke) {
        this.container.innerHTML +=`<p class="output">${joke}</p>`
    }

    clickButton(handler) {
        this.submit.addEventListener("click", handler)
    }

    isInputSaved() {
        if (this.checkbox.checked) {
            cookie_data.set('name', this._model.getValueInput());
            this.text.value = this._model.getValueInput();
        } else {
            cookie_data.delete('name');

            this.text.value = '';
        }
    }

    showText(err, res) {
        if (err) throw new Error(err);

        this.addJoke(this._model.removeNorries(res.joke));
    }

    init() {
        const get = cookie_data.get("name");

        if (get) {
            this.text.value = get;
            this.checkbox.checked = true;
        }
    }
}


class JokeController {
    constructor(model, view) {
        this._view = view;
        this._model = model;
    }

    init() {
        this._view.init();
        this.listeners();
    }

    listeners() {
        this._view.clickButton(function (event) {
            this._model.setValueInput(this._view.text.value);

            if (this._model.validateText(this._model.getValueInput())) {
                event.preventDefault();

                this._model.requestJoke(`http://api.icndb.com/jokes/random?firstName="${this._model.getValueInput()}`, this._view.showText.bind(this._view));

                this._view.isInputSaved();
            }
        }.bind(this));
    }
}


window.onload = function () {
  const modelJoke = new JokeModel();
  const viewJoke = new JokeView(modelJoke);
  const controllerJoke = new JokeController(modelJoke, viewJoke);
  
  controllerJoke.init();
};
























