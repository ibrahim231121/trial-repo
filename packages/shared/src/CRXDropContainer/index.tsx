import React from 'react'
import { IconButton, Paper  } from '@material-ui/core'
//import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import './CRXDropContent.scss'

interface propsType {
    icon? : any,
    color?: 'default' | 'primary' | 'secondary',
    className?: string,
    content : React.ReactNode,
    paperClass? : string, 
}

// const theme = createMuiTheme({
//     palette: {
//         primary: {
//             main: "#333333",
//             light: '#0066ff',
//         },
//         secondary: {
//             main: "#ffffff",
//         },
        
//     },
//   });

const CRXDropContainer = ({icon, color, className, paperClass, content} : propsType) => {
    const [state, setstate] = React.useState<boolean>(false)

    const clickHandler = () => {
        setstate(state == false ? true : false);
    }
    return (
        <div className="iconContent">
            <IconButton
                color={color}
                className={"buttonStyle " + className}
                component="div"
                onClick={clickHandler}
                disableRipple={true}
            >
              <div className="iconStyle">{icon}</div>
            </IconButton>
            {state ? 
            <Paper className={"paperStyle " + paperClass} variant="outlined" square>
                {content} 
            </Paper> : " "
             }
        </div>
    )
}

export default CRXDropContainer;