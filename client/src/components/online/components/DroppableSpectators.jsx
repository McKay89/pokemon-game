import React from 'react';
import {useDroppable} from '@dnd-kit/core';

export function DroppableSpectators(props) {
  const {isOver, setNodeRef} = useDroppable({
    id: props.id,
  });
  const style = {
    backgroundColor: isOver ? "#06798977" : "#06798900"
  };

  return (
    <div ref={setNodeRef} style={style} className="waiting-room-droppable-spectators">
      {props.children}
    </div>
  );
}