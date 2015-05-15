(function () {
  'use strict';
  
  var LayeredComponentMixin = {
    componentDidMount: function() {
      // Appending to the body is easier than managing the z-index of
      // everything on the page.  It's also better for accessibility and
      // makes stacking a snap (since components will stack in mount order).
      console.log("LayeredComponentMixin.componentDidMount");
      this._layer = document.createElement('div');
      document.body.appendChild(this._layer);
      this._renderLayer();
    },

    componentDidUpdate: function() {
      this._renderLayer();
    },

    componentWillUnmount: function() {
      this._unrenderLayer();
      document.body.removeChild(this._layer);
    },

    _renderLayer: function() {
      console.log("LayeredComponentMixin._renderLayer");
      // By calling this method in componentDidMount() and
      // componentDidUpdate(), you're effectively creating a "wormhole" that
      // funnels React's hierarchical updates through to a DOM node on an
      // entirely different part of the page.

      var layerElement = this.renderLayer();
      // Renders can return null, but React.render() doesn't like being asked
      // to render null. If we get null back from renderLayer(), just render
      // a noscript element, like React does when an element's render returns
      // null.
      if (layerElement === null) {
        React.render(<noscript />, this._layer);
      } else {
        React.render(layerElement, this._layer);
      }

      if (this.layerDidMount) {
        this.layerDidMount(this._layer);
      }
    },

    _unrenderLayer: function() {
      if (this.layerWillUnmount) {
        this.layerWillUnmount(this._layer);
      }

      React.unmountComponentAtNode(this._layer);
    }
  };

  var App = React.createClass({
    /*mixins: [LayeredComponentMixin],
    getInitialState: function() {
      return {shown: false, modalShown: false};
    },
    componentDidMount: function() {
      console.log("App.componentDidMount");
    },
    renderLayer: function() {
      console.log("App.renderLayer");
      if (!this.state.shown) {
        return <span />;
      }
      return (
        <Modal onRequestClose={this.handleClick}>
          <h1>Hello!</h1>
          Look at these sweet reactive updates: {this.state.modalShown}
        </Modal>
      );
    },*/
    render: function() {
      return (
        <div>
          <div className="playerlist_title" >Player ranking</div>
          <PlayersList url="api/players" />
        </div>
      );
    }
  });

  var PlayersList = React.createClass({
    loadPlayersFromServer: function() {
      $.ajax({
        url: this.props.url,
        dataType: 'json',
        success: function(data) {
          this.setState({data: data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });
    },
    getInitialState: function() {
      return {data: []};
    },
    componentDidMount: function() {
      this.loadPlayersFromServer();
    },
    render: function() {
      var playerItems = this.state.data.map(function(player, index) {
        return (
          <PlayerItem name={player.name} 
                      rank={player.ranking}
                      position={player.positionText}
                      team={player.teamName}
                      id={player.id}
                      key={index}>
          </PlayerItem>
        );
      });
      return (
        <div>
          {playerItems}
        </div>
      );
    }
  });

  var PlayerItem = React.createClass({
    mixins: [LayeredComponentMixin],
    handleClick: function() {
      this.setState({shown: !this.state.shown});
      console.log("PlayerItem.handleClick");
      //this.renderLayer();
    },
    getInitialState: function() {
      return {shown: false, modalShown: false};
    },
    componentDidMount: function() {
      console.log("PlayerItem.componentDidMount");
    },
    renderLayer: function() {
      console.log("PlayerItem.renderLayer");
      if (!this.state.shown) {
        return <span />;
      }
      return (
        <Modal url={'api/player/'+this.props.id} onRequestClose={this.handleClick}></Modal>
      );
    },
    render: function() {
      console.log("PlayerItem.render: shown state: ", this.state.shown);
      return (
        <div className="playerlist_item" onClick={this.handleClick}>
          
          <div className="playerlist_item_rank">
            {this.props.rank}
          </div>
          
          <div className="playerlist_item_right_container">
            <div className="playerlist_item_name">
              {this.props.name}
            </div>
            <div className="playerlist_item_subinfo">
              {this.props.position + ', ' + this.props.team}
            </div>
          </div>
        </div>
      );
    }
  });



  var Modal = React.createClass({
    loadPlayerFromServer: function() {
      $.ajax({
        url: this.props.url,
        dataType: 'json',
        success: function(data) {
          this.setState({data: data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });
    },
    getInitialState: function() {
      return {data: []};
    },
    componentDidMount: function() {
      this.loadPlayerFromServer();
    },
    killClick: function(e) {
      // clicks on the content shouldn't close the modal
      e.stopPropagation();
    },
    handleBackdropClick: function() {
      // when you click the background, the user is requesting that the modal gets closed.
      // note that the modal has no say over whether it actually gets closed. the owner of the
      // modal owns the state. this just "asks" to be closed.
      this.props.onRequestClose();
    },
    render: function() {
      console.log("Modal.render, data: ", this.state.data);
      return (
        <div className="ModalBackdrop" onClick={this.handleBackdropClick}>
          <div className="ModalContent" onClick={this.killClick}>
            <div className="playerlist_item" >
              <div className="playerlist_item_rank">
                {this.state.data.ranking}
              </div>
              <div className="playerlist_item_right_container">
                <div className="playerlist_item_name">
                  {this.state.data.name}
                </div>
                <div className="playerlist_item_subinfo">
                  {this.state.data.positionText + ', ' + this.state.data.teamName}
                </div>
              </div>
            </div>
            <div className="player_info" >
              <div className="info_title">Weight</div>
              <div className="info_value">{this.state.data.weight}</div>
            </div>
            <div className="player_info" >
              <div className="info_title">Height</div>
              <div className="info_value">{this.state.data.height}</div>
            </div>
            <div className="player_info" >
              <div className="info_title">Age</div>
              <div className="info_value">{this.state.data.age}</div>
            </div>
            <div className="player_info" >
              <div className="info_title">Goals</div>
              <div className="info_value">{this.state.data.goal}</div>
            </div>
            <div className="player_info" >
              <div className="info_title">Assists</div>
              <div className="info_value">{this.state.data.assistTotal}</div>
            </div>
          </div>
        </div>
      );
    }
  });

    React.render(<App />, document.body);

}());

/**
player data object  { 
  passSuccess: '83.51528384',
  ranking: '2',
  seasonId: '4336',
  seasonName: '2014/2015',
  tournamentId: '3',
  tournamentRegionId: '81',
  tournamentRegionCode: 'de',
  regionCode: 'nl',
  tournamentName: 'Bundesliga',
  tournamentShortName: 'GB',
  firstName: 'Arjen',
  lastName: 'Robben',
  playerId: '4173',
  isActive: 'TRUE',
  isOpta: 'TRUE',
  teamId: '37',
  teamName: 'Bayern Munich',
  playedPositions: '-FW-ML-MR-',
  age: '31',
  height: '180',
  weight: '80',
  positionText: 'Midfielder',
  apps: '18',
  subOn: '1',
  minsPlayed: '1475',
  rating: '8.56',
  goal: '16',
  assistTotal: '5',
  yellowCard: '0',
  redCard: '0',
  shotsPerGame: '4.388888889',
  aerialWonPerGame: '0.9444444444',
  manOfTheMatch: '9',
  name: 'Arjen Robben',
  isManOfTheMatch: 'FALSE',
  playedPositionsShort: 'M(LR),FW' }
*/

