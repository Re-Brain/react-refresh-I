# useState Feature Ideas — Horse Card Project

## Simple

### Toggle Favorite
- Click a star/bookmark icon to mark a horse as favorited
- Icon fills/unfills on click
- State: `const [saved, setSaved] = useState(false)`

### Like Cap
- Disable the like button after reaching a limit (e.g. max 10 likes)
- State: `const [like, setLike] = useState(0)`
- Disable condition: `disabled={like >= 10}`

### Unlike
- Click the heart again to remove a like
- Toggles between liked/unliked instead of always incrementing
- State: `const [liked, setLiked] = useState(false)`

---

## Medium

### Expand/Collapse Details
- A "Show more" button that reveals extra horse info (age, record, trainer)
- State: `const [expanded, setExpanded] = useState(false)`
- Conditionally render extra details based on `expanded`

### Image Zoom Toggle
- Click the image to expand it to full size
- State: `const [zoomed, setZoomed] = useState(false)`
- Toggle a CSS class or size based on `zoomed`

---

## More Interesting (Lift State Up)

### Total Likes Counter in Header
- Show the sum of all card likes at the top of the page
- Requires moving like state up to `App` and passing it down via props
- Introduces: **lifting state up**, **props**, **callbacks**

### Sort Cards by Likes
- A button in `App` that re-orders the grid by most liked
- Requires likes to live in `App`, not inside each `Card`
- Introduces: **array sorting**, **derived state**, **controlled components**
