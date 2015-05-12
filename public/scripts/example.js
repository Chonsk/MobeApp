
var PlayersPage = React.createClass({
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
    //setInterval(this.loadPlayersFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="PlayersPage">
        <h1>Players</h1>
        <PlayersList data={this.state.data} />
      </div>
    );
  }
  /*handleCommentSubmit: function(comment) {
    var comments = this.state.data;
    comments.push(comment);
    this.setState({data: comments}, function() {
      // `setState` accepts a callback. To avoid (improbable) race condition,
      // `we'll send the ajax request right after we optimistically set the new
      // `state.
      $.ajax({
        url: this.props.url,
        dataType: 'json',
        type: 'POST',
        data: comment,
        success: function(data) {
          this.setState({data: data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });
    });
  },*/
});

var PlayersList = React.createClass({
  render: function() {
    var commentNodes = this.props.data.map(function(player, index) {
      return (
        // `key` is a React-specific concept and is not mandatory for the
        // purpose of this tutorial. if you're curious, see more here:
        // http://facebook.github.io/react/docs/multiple-components.html#dynamic-children
        <PlayerItem name={player.name} rank={player.ranking} position={player.positionText} team={player.teamName} key={index}>
        </PlayerItem>
      );
    });
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
});

var PlayerItem = React.createClass({
  render: function () {
    return (
      <div className="comment">
        <h2 className="commentAuthor">
          {this.props.rank}
          {this.props.name}
        </h2>
        <span className="commentAuthor">
          {this.props.position}
        </span>
        <span className="commentAuthor">
          {this.props.team}
        </span>
      </div>
    );
  }
});


React.render(
  <PlayersPage url="players" />,
  document.getElementById('content')
);
