(function () {
  'use strict';

  var LayeredComponentMixin = {
    componentDidMount: function() {
      console.log("LayeredComponentMixin.componentDidMount");
      this._layer = document.getElementById('popup_node');
      this._renderLayer();
    },

    componentDidUpdate: function() {
      console.log("LayeredComponentMixin.componentDidUpdate");
      this._renderLayer();
    },

    componentWillUnmount: function() {
      console.log("LayeredComponentMixin.componentWillUnmount");
      this._unrenderLayer();
      var popupNode = document.getElementById('popup_node');
      popupNode.removeChild(this._layer);
    },

    _renderLayer: function() {
      console.log("LayeredComponentMixin._renderLayer");
      var layerElement = this.renderLayer();

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
      console.log("LayeredComponentMixin._unrenderLayer");
      if (this.layerWillUnmount) {
        this.layerWillUnmount(this._layer);
      }
      React.unmountComponentAtNode(this._layer);
    }
  };

  var App = React.createClass({
    mixins: [LayeredComponentMixin],
    handleClick: function() {
      //console.log("PlayerItem.handleClick");
      var that = this;
      document.getElementById('popup_node').className = 'hidden';
      setTimeout(function() {
        that.setState({shown: !that.state.shown});
      }, 200);
    },
    getInitialState: function() {
      return {shown: false, activePlayer: 0};
    },
    renderLayer: function() {
      //console.log("PlayerItem.renderLayer");
      if (!this.state.shown) {
        return <span />;
      } else {
      }
      return (
        <Popup url={'api/player/'+this.state.activePlayer} onRequestClose={this.handleClick}></Popup>
      );
    },
    _onPlayerClicked: function(id) {
      console.log("App.onPlayerClicked: ", id);
      document.getElementById('popup_node').className = 'visible';
      this.setState({shown: !this.state.shown, activePlayer: id});
    },
    render: function() {
      var that = this;
      return (
        <div>
          <div className="playerlist_title" >Player ranking</div>
          <PlayersList url="api/players" onPlayerClicked={that._onPlayerClicked}/>
          <div id="popup_node" className="hidden" ></div>
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
    _onPlayerClicked: function(id) {
      console.log("PlayersList.onPlayerClicked: ", id);
      this.props.onPlayerClicked(id);
    },
    render: function() {
      var that = this;
      var playerItems = this.state.data.map(function(player, index) {
        return (
          <PlayerItem name={player.name} 
                      rank={player.ranking}
                      position={player.positionText}
                      team={player.teamName}
                      id={player.id}
                      key={player.id}
                      onPlayerClicked={that._onPlayerClicked}>
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
    handleClick: function() {
      //console.log("PlayerItem.handleClick");
      this.props.onPlayerClicked(this.props.id);
    },
    render: function() {
      //console.log("PlayerItem.render: shown state: ", this.state.shown);
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


  // Popup component
  var Popup = React.createClass({
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
      // clicks on the content shouldn't close the popup
      e.stopPropagation();
    },
    handleBackdropClick: function() {
      // when you click the background, the user is requesting that the popup gets closed.
      // note that the popup has no say over whether it actually gets closed. the owner of the
      // popup owns the state. this just "asks" to be closed.
      this.props.onRequestClose();
    },
    render: function() {

      var passPercentage = (1 * this.state.data.passSuccess).toFixed(2); //round
      
      return (
        <div className="popup_backdrop" onClick={this.handleBackdropClick}>
          <div className="popup_content" onClick={this.killClick}>
            <div className="player_header" >

              <div className="playerlist_item_right_container">
                <div className="playerlist_item_name">
                  {this.state.data.name}
                </div>
                <div className="playerlist_item_subinfo">
                  {this.state.data.teamName}
                </div>
              </div>
            </div>
            <div>
              <div className="player_info_header" >Player info</div>
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
                <div className="info_title">Position</div>
                <div className="info_value">{this.state.data.positionText}</div>
              </div>
            </div>
            <div>
              <div className="player_info_header" >{'Statistics season ' + this.state.data.seasonName}</div>
              <div className="player_info" >
                <div className="info_title">Goals</div>
                <div className="info_value">{this.state.data.goal}</div>
              </div>
              <div className="player_info" >
                <div className="info_title">Assists</div>
                <div className="info_value">{this.state.data.assistTotal}</div>
              </div>
              <div className="player_info" >
                <div className="info_title">Played positions</div>
                <div className="info_value">{this.state.data.playedPositions}</div>
              </div>
              <div className="player_info" >
                <div className="info_title">Appearances</div>
                <div className="info_value">{this.state.data.apps}</div>
              </div>
              <div className="player_info" >
                <div className="info_title">Appearances as sub</div>
                <div className="info_value">{this.state.data.subOn}</div>
              </div>
              <div className="player_info" >
                <div className="info_title">Cards</div>
                <div className="info_value">
                  <div className="card yellow">{this.state.data.yellowCard}</div>
                  <div className="card red">{this.state.data.redCard}</div>
                </div>
              </div>
              <div className="player_info" >
                <div className="info_title">Pass percentage</div>
                <div className="info_value">{passPercentage}</div>
              </div>
              <div className="player_info" >
                <div className="info_title">Minutes played</div>
                <div className="info_value">{this.state.data.minsPlayed}</div>
              </div>
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
