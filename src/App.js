import React from 'react';
import './App.css';


const getFetchURL = (type = 'tv', id) =>
  `https://api.themoviedb.org/3/${type}/${id}/credits?api_key=d619b44f7be3d2cdca96936a2c1eb556&language=en-US`
const getIDLookupUrl = (query) => `https://api.themoviedb.org/3/search/tv?api_key=d619b44f7be3d2cdca96936a2c1eb556&language=en-US&query=${encodeURIComponent(query)}`;
class App extends React.Component {
  constructor() {
    super();
    this.state = {
      err: '',
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
      const cast1 = (await fetch(getFetchURL('tv', ids[0].trim())).then(response => response.json())).cast;
      const cast2 = (await fetch(getFetchURL('tv', ids[1].trim())).then(response => response.json())).cast;
      console.log({ cast1, cast2 })
      const cast1CreditIds = cast1.map(cast => cast.id);
      const cast2CreditIds = cast2.map(cast => cast.id);
      const commonCastIds = cast1CreditIds.filter(castId => cast2CreditIds.includes(castId));
      this.setState({
        commonCast: commonCastIds.map(castId => ({ castA: cast1.find(cast => cast.id === castId), castB: cast2.find(cast => cast.id === castId) })),
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
            <div className="characters"><b>{commonCastMember.castA.character}</b> and <b>{commonCastMember.castB.character}</b></div>
            <div className="actor">are played by <b>{commonCastMember.castA.name}</b></div>
            <img src={`https://image.tmdb.org/t/p/w500/${commonCastMember.castA.profile_path}`} />
            <div className="actor"><b>{commonCastMember.castA.name}</b></div>
          </div>)}</div>) :
          <h4>Sadly, there is no crossover according to IMDB</h4>}
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
        const results = (await (await fetch(getIDLookupUrl(this.state.searchName))).json()).results;
        this.setState({ idLookupResults: results, loadingLookup: false, searchName: '' })
        this.setState({ loadingLookup: false })
      }}>Search</button> : ''}
      {this.state.idLookupResults && <div className="id-lookup-container">{this.state.idLookupResults.map(idLookupResult => <div><b>{idLookupResult.id}</b> - {idLookupResult.name} ({new Date(idLookupResult.first_air_date).getFullYear()}) </div>)}</div>}
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
          <div>Thanks to <a href="https://www.themoviedb.org">theMovieDb</a> (TMDb) for their wonderful API.</div>

        </div>
      </div>
    );
  }
}

export default App;