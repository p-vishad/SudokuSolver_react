import React from 'react';

function Header(props){

  return (
    <div className="header">
      <h1>Sudoku Solver</h1>
    </div>
  )

}

function Square(props) {

  return (
    <button className={props.value === 0 ? "square_empty" : (props.redColor ? "square_red" : "square")} onClick={() => props.onClick()}>
      {props.value}
    </button>
  )

}

function Box(props){

  const buildBoxRow = (row_num) => {
    const box_row = [];

    for (let i = 0; i < 3; i++){
      box_row.push(<Square 
                      value={props.values[(props.box_i*3)+row_num][(props.box_j*3)+i]} 
                      redColor={props.redColor[(props.box_i*3)+row_num][(props.box_j*3)+i]}
                      onClick={() => props.onClick((props.box_i*3)+row_num, (props.box_j*3)+i)}
                  />);
    }

    return box_row;
  }

  const curr_Box = [];

  for (let i = 0; i < 3; i++){
    curr_Box.push(buildBoxRow(i));
  }

  return (
    <div className="box">
      {curr_Box}
    </div>
  )

}

class Sudoku extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // 0 represents empty cell
      values: [ 
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
              ],
      redColor: [
                  [false, false, false, false, false, false, false, false, false],
                  [false, false, false, false, false, false, false, false, false],
                  [false, false, false, false, false, false, false, false, false],
                  [false, false, false, false, false, false, false, false, false],
                  [false, false, false, false, false, false, false, false, false],
                  [false, false, false, false, false, false, false, false, false],
                  [false, false, false, false, false, false, false, false, false],
                  [false, false, false, false, false, false, false, false, false],
                  [false, false, false, false, false, false, false, false, false],
                ],
      not_clickable: [
                  [false, false, false, false, false, false, false, false, false],
                  [false, false, false, false, false, false, false, false, false],
                  [false, false, false, false, false, false, false, false, false],
                  [false, false, false, false, false, false, false, false, false],
                  [false, false, false, false, false, false, false, false, false],
                  [false, false, false, false, false, false, false, false, false],
                  [false, false, false, false, false, false, false, false, false],
                  [false, false, false, false, false, false, false, false, false],
                  [false, false, false, false, false, false, false, false, false],
                ],
    }
  }

  // x refers to row, i refers to columns, indexed from 0 like usual
  handleClick = (x, i) => {
    if (!this.state.not_clickable[x][i]){
      // better practice to create new array, change the desired elem and reassign...helps if we want to save multiple states anytime in the future
      const new_values = this.state.values.slice();
      new_values[x][i] = (new_values[x][i] === 9) ? 0 : (new_values[x][i]+1);
      this.setState({values: new_values});
    }
  }

  makeBoard = () => {
    const board = [];

    for (let i = 0; i < 3; i++){
      for (let j = 0; j < 3; j++){
        board.push(<Box box_i={i} box_j={j} values={this.state.values} redColor={this.state.redColor} onClick={(x, y) => this.handleClick(x, y)}/>);
      }
    }

    return (
      <div className="sudoku_board">
        {board}
      </div>
    )
  }

  solver = () => {
    var new_board = this.state.values;
    this.solver_helper(new_board);
    this.setState({values: new_board});
  }

  solver_helper = (board) => {
    let next_empty = this.solver_findEmpty(board);
    if (next_empty===null){
      return true;
    }

    for (let num = 1; num < 10; num++){
      if (this.solver_insertionValid(board, next_empty[0], next_empty[1], num)){
        board[next_empty[0]][next_empty[1]] = num;
        if (this.solver_helper(board)){
          return true;
        }
        board[next_empty[0]][next_empty[1]] = 0;
      }
    }
    return false;
  }

  solver_findEmpty = (board) => {
    for (let i = 0; i < 9; i++){
      for (let j = 0; j < 9; j++){
        if (board[i][j]===0){
          return [i,j];
        }
      }
    }
    return null;
  }

  solver_insertionValid = (board, row, col, num) => {
    // checking row
    for (let i = 0; i < 9; i++){
      if (board[row][i]===num){
        return false;
      }
    }
    // checking col
    for (let i = 0; i < 9; i++){
      if (board[i][col]===num){
        return false;
      }
    }
    // checking boxes
    const x_box = Math.floor(row/3);
    const y_box = Math.floor(col/3);
    for (let i = 0; i < 3; i++){
      for (let j = 0; j < 3; j++){
        if (board[(x_box*3)+i][(y_box*3)+j]===num){
          return false;
        }
      }
    }
    return true;
  }

  // what the fuckk is async and await

  receivePuzzle = async () => {
    const url = "https://sugoku.herokuapp.com/board?difficulty=hard";
    const response = await fetch(url);
    const data = await response.json();
    this.resetPuzzle();
    this.setState({values: data.board});
    const newColor = this.state.redColor.slice();
    const newClickRules = this.state.not_clickable.slice();
    for (let i = 0; i < 9; i++){
      for (let j = 0; j < 9; j++){
        if (data.board[i][j] !== 0){
          newColor[i][j] = !newColor[i][j];
          newClickRules[i][j] = !newClickRules[i][j];
        }
      }
    }
    this.setState({redColor: newColor, not_clickable: newClickRules});
  }

  resetPuzzle = () => {
    // there is probably a smarter way to do this...array mappings?
    this.setState({values: [ 
                              [0,0,0,0,0,0,0,0,0],
                              [0,0,0,0,0,0,0,0,0],
                              [0,0,0,0,0,0,0,0,0],
                              [0,0,0,0,0,0,0,0,0],
                              [0,0,0,0,0,0,0,0,0],
                              [0,0,0,0,0,0,0,0,0],
                              [0,0,0,0,0,0,0,0,0],
                              [0,0,0,0,0,0,0,0,0],
                              [0,0,0,0,0,0,0,0,0],
                            ],  
                  redColor: [
                    [false, false, false, false, false, false, false, false, false],
                    [false, false, false, false, false, false, false, false, false],
                    [false, false, false, false, false, false, false, false, false],
                    [false, false, false, false, false, false, false, false, false],
                    [false, false, false, false, false, false, false, false, false],
                    [false, false, false, false, false, false, false, false, false],
                    [false, false, false, false, false, false, false, false, false],
                    [false, false, false, false, false, false, false, false, false],
                    [false, false, false, false, false, false, false, false, false],
                  ],
                not_clickable: [
                  [false, false, false, false, false, false, false, false, false],
                  [false, false, false, false, false, false, false, false, false],
                  [false, false, false, false, false, false, false, false, false],
                  [false, false, false, false, false, false, false, false, false],
                  [false, false, false, false, false, false, false, false, false],
                  [false, false, false, false, false, false, false, false, false],
                  [false, false, false, false, false, false, false, false, false],
                  [false, false, false, false, false, false, false, false, false],
                  [false, false, false, false, false, false, false, false, false],
                ]
              })
  }

  render () {
    return (
      <div className="sudoku_interface"> 
        {this.makeBoard()}
        <div className="buttons">
          <button className="button" onClick={() => {this.solver()}}>Solve</button>
          <button className="button" onClick={() => {this.receivePuzzle()}}>Generate</button>
          <button className="button" onClick={() => {this.resetPuzzle()}}>Reset</button>
        </div>
      </div>
    );
  }
}

function Game() {
  return (
      <Sudoku/>
  )
}

function App() {
  return (
    <div>
      <Header/>
      <Game/>
    </div>
  )
}

export default App;