import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export function Draggable(props) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: props.id,
  });
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={props.className}>
      {props.children}
    </div>
  );
}