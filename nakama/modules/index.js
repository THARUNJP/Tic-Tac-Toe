function matchInit(ctx, logger, nk, params) {
  logger.info("Match initialized");

  var state = {
    board: [null, null, null, null, null, null, null, null, null],
    currentPlayer: "X",
    players: {},
    winner: null,
    moveCount: 0,
  };

  return {
    state: state,
    tickRate: 1,
  };
}

function matchJoinAttempt(
  ctx,
  logger,
  nk,
  dispatcher,
  tick,
  state,
  presence,
  metadata,
) {
  return {
    state: state,
    accept: true,
  };
}

function matchJoin(ctx, logger, nk, dispatcher, tick, state, presences) {
  for (var i = 0; i < presences.length; i++) {
    var p = presences[i];

    if (!state.players.X) {
      state.players.X = p.userId;
    } else if (!state.players.O) {
      state.players.O = p.userId;
    }
  }

  logger.info("Players: " + JSON.stringify(state.players));

  return { state: state };
}

function matchLoop(ctx, logger, nk, dispatcher, tick, state, messages) {

  for (var i = 0; i < messages.length; i++) {
    var msg = messages[i];
    var data = JSON.parse(msg.data);

    var position = data.position; // 0–8
    var userId = msg.sender.userId;

    //  If game already finished
    if (state.winner) continue;

    //  Check turn
    if (state.players[state.currentPlayer] !== userId) {
      continue;
    }

    //  Check if cell already filled
    if (state.board[position] !== null) {
      continue;
    }

    //  Apply move
    state.board[position] = state.currentPlayer;
    state.moveCount++;

    //  Switch turn
    state.currentPlayer = state.currentPlayer === "X" ? "O" : "X";
  }

  //  Broadcast state to all players
  dispatcher.broadcastMessage(1, JSON.stringify(state));

  return { state: state };
}

function matchLeave(ctx, logger, nk, dispatcher, tick, state, presences) {
  logger.info("Player left");
  return { state: state };
}

function matchTerminate(
  ctx,
  logger,
  nk,
  dispatcher,
  tick,
  state,
  graceSeconds,
) {
  logger.info("Match terminated");
  return { state: state };
}

function matchSignal(ctx, logger, nk, dispatcher, tick, state, data) {
  return {
    state: state,
    data: "signal received",
  };
}

function InitModule(ctx, logger, nk, initializer) {
  initializer.registerMatch("tic-tac-toe", {
    matchInit: matchInit,
    matchJoinAttempt: matchJoinAttempt,
    matchJoin: matchJoin,
    matchLoop: matchLoop,
    matchLeave: matchLeave,
    matchTerminate: matchTerminate,
    matchSignal: matchSignal,
  });
}
