import { useEffect, useRef, useState } from 'react';
import './App.css'
import { useAuth } from './context';

function App() {
	const { list } = useAuth();
	const [liststate, setlist] = useState<string[]>([...list]);
	const [listChanged, setlistChanged] = useState<boolean>(false);
	const [targetIndex, setTargetIndex] = useState<number>(0);
	const [startIndex, setStartIndex] = useState<number>(0);

	const listArray = useRef<string[]>([])
	const switchableRows = useRef<NodeListOf<ChildNode> | null>(null);
	const dragElem = useRef<HTMLElement | null>(null);
	const documentRef = useRef<Document>(document);
	const targetRow = useRef<HTMLElement | null>(null);
	const touchTimeout = useRef<number | null>(null);

	useEffect(() => {
		function swapSubs(startIndex: number, targetIndex: number) {
			const data = [...list];
			console.log(data, startIndex, targetIndex);
			const temp = data[startIndex];
			if (startIndex < targetIndex) {
				for (let i = startIndex; i < targetIndex; i++) {
					data[i] = data[i+1];
				}
				data[targetIndex] = temp;
			} else {
				for (let i = startIndex; i > targetIndex; i--) {
					data[i] = data[i-1];
				}
				data[targetIndex] = temp;
			}
			console.log(data, startIndex, targetIndex);
			setlist([...data]);
		}

		function handleTouchMove(event: TouchEvent) {
			function swapRow(row: HTMLElement , index: number) {
				if (!targetRow.current || !dragElem.current) return
				const tbody: HTMLElement = document.getElementsByClassName('containedList')[0].childNodes[0] as HTMLElement;
				const currIndex: number = Array.from(tbody.children).indexOf(targetRow.current as HTMLElement),
					row1 = currIndex > index ? targetRow.current : row,
					row2 = currIndex > index ? row : targetRow.current;

				tbody.insertBefore(row1 as Node, row2);
				setTargetIndex(() => index);
				row.childNodes[0].textContent = String(currIndex + 1);
				targetRow.current.childNodes[0].textContent = String(index + 1);
				dragElem.current.childNodes[0].textContent = String(index + 1);
			}

			function moveRow() {
				if (!switchableRows.current || !dragElem.current) return
				for (let i = 0; i < switchableRows.current.length; i++) {
					const row = switchableRows.current[i],
						dragPos = dragElem.current.getBoundingClientRect();
					if (row !== targetRow.current && row !== dragElem.current && isIntersecting(dragPos, row as HTMLElement)) {
						swapRow(row as HTMLElement, i);
					}
				}
			}

			if (!targetRow.current) return
			event.stopImmediatePropagation();
			event.stopPropagation();
			event.preventDefault();
			const location = {x: event.targetTouches[0].pageX, y: event.targetTouches[0].pageY};
			const programContainer = document.getElementsByClassName('programContainer')[0].getBoundingClientRect();
			const appPage: HTMLElement | null = document.querySelector('div.appPage');
			if (dragElem.current != null && appPage != null) {
				dragElem.current.style.top = location.y + 'px';
				moveRow();
			}
		}

		function getStyle(element: HTMLElement|ChildNode, style: "height"|"width"|"backgroundColor"): string {
			const compStyle: CSSStyleDeclaration = getComputedStyle(element as Element);

			return compStyle[style];
		}

		function createDragElem() {
			const programContainer = document.getElementsByClassName('programContainer')[0].getBoundingClientRect();
			const appPage: HTMLElement | null = document.querySelector('div.appPage');
			if (targetRow.current && appPage) {
				dragElem.current = targetRow.current.cloneNode(true) as HTMLElement;
				dragElem.current.classList.add('drag_element');
				dragElem.current.style.top = targetRow.current.getBoundingClientRect().y + targetRow.current.getBoundingClientRect().height/2 + "px";
				dragElem.current.style.left = targetRow.current.getBoundingClientRect().x + "px";
				dragElem.current.style.width = getStyle(targetRow.current, 'width');
				for (let i = 0; i < targetRow.current.childNodes.length; i++) {
					const oldTH = targetRow.current.childNodes[i];
					(dragElem.current.childNodes[i] as HTMLElement).style.height = getStyle(oldTH, 'height');
					(dragElem.current.childNodes[i] as HTMLElement).style.width = getStyle(oldTH, 'width');
					(dragElem.current.childNodes[i] as HTMLElement).style.backgroundColor = getStyle(oldTH, 'backgroundColor');
				}
				const table: HTMLElement = document.getElementsByClassName('containedList')[0].childNodes[0] as HTMLElement;
				if (table.parentElement) {
					table.parentElement.style.height = getStyle(table.parentElement, 'height');
				}
				table.style.height = getStyle(table, 'height');
				table.appendChild(dragElem.current);
				dragElem.current.style.boxShadow = "1px 1px 3px var(--borderStrong)";
			}
		}

		function getTarget(target: HTMLElement) {
			if (target.tagName.toLowerCase() != 'tr') {
				target = target.closest('tr') as HTMLElement;
			}
			return target;
		}

		function isIntersecting(dragPos: DOMRect, row: HTMLElement) {
			return ((dragPos.bottom + dragPos.top)/2 > row.getBoundingClientRect().top) && ((dragPos.bottom + dragPos.top)/2 < row.getBoundingClientRect().bottom)
		}

		function dragStart() {
			if (!targetRow.current) return
			if (!listChanged) {
				listArray.current = [...list];
			}
			createDragElem();
			targetRow.current.classList.add('dragging');
		}

		function handleTouchStart(event: TouchEvent) {
			touchTimeout.current = setTimeout(() => {
				touchTimeout.current = null;
				if (targetRow.current === null) targetRow.current = getTarget(event.target as HTMLElement);
				if (targetRow.current === null) return
				if (!targetRow.current.parentElement) return
				switchableRows.current = targetRow.current.parentElement.childNodes;
				for (let i = 0; i < switchableRows.current.length; i++) {
					const row = switchableRows.current[i];
					if (row === targetRow.current) {
						setStartIndex(i);
						setTargetIndex(i);
					}
				}
				documentRef.current.addEventListener('touchmove', handleTouchMove, {passive: false});
				dragStart();
			}, 1000);
		}

		function handleTouchEnd() {
			if (touchTimeout.current != null) {
				clearTimeout(touchTimeout.current);
				touchTimeout.current = null;
				return
			}
			if (!targetRow.current) return
			if (dragElem.current != null) {
				const table = document.getElementsByClassName('containedList')[0].childNodes[0];
				table.removeChild(dragElem.current as HTMLElement);
				dragElem.current = null;
			}
			targetRow.current.classList.remove('dragging');
			targetRow.current = null;
			if (targetIndex !== startIndex) {
				swapSubs(startIndex, targetIndex)
				setlistChanged(true);
			}
		}

		document.addEventListener('touchend', handleTouchEnd);
		document.addEventListener('touchstart', handleTouchStart);
		return () => {
			document.removeEventListener('touchend', handleTouchEnd);
			document.removeEventListener('touchstart', handleTouchStart);
		}
	}, [list, listChanged, startIndex, targetIndex]);

	return (
		<>
			<table className="containedList">
				<tbody>
				{liststate.length == 4 && 
					list.map((listElement: string, index: number) => {
						return (
							<tr key={index} draggable='true'>
								<th>{index + 1}</th>
								<th>{listElement}</th>
							</tr>
						);
					}
				)}
				</tbody>
			</table>
		</>
	)
}

export default App
