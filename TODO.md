# To do

Some ideas for improving Otto.

  - Cleaner code maybe.
    - Ideally the GameBoard should probably have a reference to the canvas as a
      property which would be passed into it.
    - The rules box should maybe get its own object. This could handle setting
      up the appropriate callbacks. It should probably have the elements passed
      into it and keep references to them.
    - The rules string area should probably get its own object. It would need a
      reference to the game board object and a reference to the rules box
      object, I think.
    - The controls box should probably get its own object. Then it can track
      its current state and set things up so that the appropriate controls are
      disabled in the "playing" state but enabled in the "stopped" state.
      - On the other hand this seems like maybe giving too much power to the
        controls box. Maybe there should be a master object with a state
        machine that handles this? Might be too much though. It feels like too
        much.
  - Should users be able to toggle cell states while the automaton is playing?
    I don't see why not except that it isn't very consistent with all of the
    other controls being disabled.
  - Display an error when the user-entered rule (in the rule string field) is
    empty.
  - Implement click-and-drag-to-paint for the game board.
  - Implement a rules dropdown box with some rules from Wikipedia.
    - I'll have to figure out where to put this. Work it into the sketch.