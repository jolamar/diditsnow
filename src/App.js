import React, { Component } from 'react';
import './App.css';
import axios from 'axios';

const ikonResorts = [
  'Copper Mountain',
  'Aspen / Snowmass',
  'Steamboat',
  'Winter Park',
  'Eldora',
]

const epicResorts = [
  'Telluride',
  'Crested Butte',
  'Breckenridge',
  'Vail',
  'Arapahoe Basin',
  'Keystone',
  'Beaver Creek',
]

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      epic: true,
      ikon: true,
      resorts: [],
      didItSnow: false
    };
    this.toggleIkon = this.toggleIkon.bind(this)
    this.toggleEpic = this.toggleEpic.bind(this)
  }

  toggleIkon() {
    const ikon = !this.state.ikon
    this.setState({ikon})

    localStorage.setItem('ikon', ikon ? 'true' : 'false')

  }
  toggleEpic() {
    const epic = !this.state.epic
    this.setState({epic})

    localStorage.setItem('epic', epic ? 'true' : 'false')
  }

  componentDidMount() {

    if(localStorage.getItem('epic')) {
      const epic = localStorage.getItem('epic') === 'true' ? true : false
      const ikon = localStorage.getItem('ikon') === 'true' ? true : false

      this.setState({epic, ikon})
    }

    axios.get('https://skiapp.onthesnow.com/app/widgets/resortlist?region=us&regionids=251&language=en&pagetype=skireport&direction=-1&order=stop&limit=45&offset=0&countrycode=USA&minvalue=-1&open=anystatus')
      .then(res => {
        this.setState({didItSnow: false})

        let resorts = res.data.rows.filter(r=> {
          const name = r.resort_name_short
          const ikon = this.state.ikon
          const epic = this.state.epic
          if((ikon && ikonResorts.includes(name)) || (epic && epicResorts.includes(name))) {
            let resort = r
            resort.key = resort._id + ""
            if(resort.pastSnow.snow0day > 0) {
              this.setState({didItSnow: true})
            }
            return resort
          }
          return false
        }).sort((a,b) => {
          if(a.pastSnow.snow0day < b.pastSnow.snow0day) {
            return 1
          }

          if(a.pastSnow.snow0day > b.pastSnow.snow0day) {
            return -1
          }

          return 0;
        })

        this.setState({resorts})
      })
  }

  componentDidUpdate(prevProps, prevState, snapshot) {

    if(prevState.epic !== this.state.epic || prevState.ikon !== this.state.ikon) {
      axios.get('https://skiapp.onthesnow.com/app/widgets/resortlist?region=us&regionids=251&language=en&pagetype=skireport&direction=-1&order=stop&limit=45&offset=0&countrycode=USA&minvalue=-1&open=anystatus')
        .then(res => {
          this.setState({didItSnow: false})

          let resorts = res.data.rows.filter(r=> {
            const name = r.resort_name_short
            const ikon = this.state.ikon
            const epic = this.state.epic
            if((ikon && ikonResorts.includes(name)) || (epic && epicResorts.includes(name))) {
              let resort = r
              resort.key = resort._id + ""
              if(resort.pastSnow.snow0day > 0) {
                this.setState({didItSnow: true})
              }
              return resort
            }
            return false
          }).sort((a,b) => {
            if(a.pastSnow.snow0day < b.pastSnow.snow0day) {
              return 1
            }

            if(a.pastSnow.snow0day > b.pastSnow.snow0day) {
              return -1
            }

            return 0;
          })
          this.setState({resorts})
        })
    }
  }



  render() {
    const logo = this.state.didItSnow
      ? require('./yes.png')
      : require('./no.png')

    const message = this.state.didItSnow ? "It snowed! :D" : "It didn't snow :("

    const ikon = this.state.ikon
    const epic = this.state.epic
    const resorts = this.state.resorts
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>{message}</p>
          <div className="toggles">
            <div class="big">Epic</div>
            <div className="toggle-border">
              <input onClick={this.toggleEpic} type="checkbox" id="epic" checked={epic}/>
              <label htmlFor="epic">
                <div className="handle"></div>
              </label>
            </div>
            <div className="big">Ikon</div>
            <div className="toggle-border">
              <input onClick={this.toggleIkon} type="checkbox" id="ikon" checked={ikon} />
              <label htmlFor="ikon">
                <div className="handle"></div>
              </label>
            </div>
          </div>
          {this.state.resorts.length === 0 && <p>Select a ski pass.</p>}

          <ul class="plain-list">
            {resorts.map(item => <li class="resort">
              <div className="resort-name">{item.resort_name_short}</div>
              <div className="resort-inches">{item.pastSnow.snow0day}"</div>
            </li>)}
          </ul>
        </header>
      </div>
    );
  }
}

export default App;
