import React from 'react';
import './App.css';


const getFetchURL = (id) =>
  `http://api.tvmaze.com/shows/${id}/cast`;
const getIDLookupUrl = (query) => `http://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`;
class App extends React.Component {
  constructor() {
    super();
    this.state = {
      err: '',
      searchName: '',
      step: 'inputs',
      ids: [],
    }
  }

  submitInputs = async () => {
    const { ids } = this.state;
    if (!ids[0] || !ids[1]) {
      this.setState({ err: 'enter two show ids from the lookup above' })
      return false;
    }
    if (ids[0] === ids[1]) {
      this.setState({ err: 'enter two different ids please' })
      return false;
    }
    try {
      const cast1 = (await fetch(getFetchURL(ids[0].trim())).then(response => response.json()));
      const cast2 = (await fetch(getFetchURL(ids[1].trim())).then(response => response.json()));
      const cast1PersonIds = cast1.map(cast => cast.person.id);
      const cast2PersonIds = cast2.map(cast => cast.person.id);
      const commonCastIds = cast1PersonIds.filter(castId => cast2PersonIds.includes(castId));
      this.setState({
        commonCast: commonCastIds.map(castId => {
          const castA = cast1.find(cast => cast.person.id === castId);
          const castB = cast2.find(cast => cast.person.id === castId);
          const person = castA.person;
          const characterA = castA.character;
          const characterB = castB.character;
          return ({ person, characterA, characterB });
        }),
        step: 'results'
      });
    } catch (err) {
      this.setState({ err: `Error: ${JSON.stringify(err)}` })
      return false;

    }
  }

  /*
  tt3837246
  tt1355642
  */
  /*
  character: "Alphonse Elric"
  credit_id: "5258a118760ee3466165388d"
  gender: 1
  id: 83928
  name: "Rie Kugimiya"
  order: 1
  profile_path: "/4k7CLf1yPWtwZRkieAPYuKzEl3L.jpg"
  */
  renderInputs = () => {
    const { ids } = this.state;
    return <div className="input-container">
      <div>
        <label>Enter First ID:</label>
        <input autoFocus onChange={e => this.setState({ ids: [e.currentTarget.value, ids[1] || ''] })} />
      </div>
      <div>
        <label>Enter Second ID:</label>
        <input onChange={e => this.setState({ ids: [ids[0] || '', e.currentTarget.value] })} />
      </div>
      <button onClick={this.submitInputs}>Search</button>
    </div>
  }
  renderResults = () => {
    return <div><div><button onClick={() => this.setState({ step: 'inputs', commonCast: [], ids: [] })}>Try Again</button></div>
      {
        this.state.commonCast.length ? (
          <div className="profile-container">{this.state.commonCast.map(commonCastMember => <div className="profile">
            <div className="characters"><b>{commonCastMember.characterA.name}</b> and <b>{commonCastMember.characterB.name}</b></div>
            <div className="actor">are played by <b>{commonCastMember.person.name}</b></div>
            <div className="image-container">
              <img src={(commonCastMember.characterA.image || {}).medium || 'Question-mark-face.jpg'} />
              <img src={(commonCastMember.characterB.image || {}).medium || 'Question-mark-face.jpg'} />
              <img src={commonCastMember.person.image.medium || './Question-mark-face.jpg'} />
            </div>
            <div className="actor"><b>{commonCastMember.person.name}</b></div>
          </div>)}</div>) :
          <h4>Sadly, there is no crossover according to the tool. It might be wrong, I'm sorry</h4>}
    </div>
  }

  renderVAFinder() {
    const { step } = this.state;
    switch (step) {
      case 'inputs':
        return this.renderInputs();
      case 'results':
        return this.renderResults();
      default:
        return 'oops';
    }
  }
  renderIDLookup() {
    return <div>
      <label>Name: </label><input onChange={e => this.setState({ searchName: e.currentTarget.value })} value={this.state.searchName} />
      {this.state.searchName ? <button onClick={async () => {
        this.setState({ loadingLookup: true })
        const results = (await (await fetch(getIDLookupUrl(this.state.searchName))).json());
        this.setState({ idLookupResults: results, loadingLookup: false, searchName: '' })
        this.setState({ loadingLookup: false })
      }}>Search</button> : ''}
      {this.state.idLookupResults && <div className="id-lookup-container">{this.state.idLookupResults.map(idLookupResult => <div><b>{idLookupResult.show.id}</b> - {idLookupResult.show.name} ({new Date(idLookupResult.show.premiered).getFullYear()}) </div>)}</div>}
      {this.state.idLookupResults && !this.state.idLookupResults.length ? 'No Results Found.' : ''}
    </div >
  }
  render() {
    return (
      <div>
        <div>
          <div className="page-body">
            <h1>ID Lookup</h1>
            {this.renderIDLookup()}
          </div>
          <div className="page-body">
            <h1>Cast Finder</h1>
            <span className="error">{this.state.err}</span>
            {this.renderVAFinder()}
          </div>
        </div>
        <div className="attribution">
          <div>Made by Richard Dobson 2019</div>
          <div>Thanks to <a href="https://www.tvmaze.com">tvmaze</a> for their wonderful API.</div>

        </div>
      </div>
    );
  }
}

export default App;