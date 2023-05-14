import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";

function ToolTip({ placement = "auto", icon = null, message = "" }) {

  let fontAwesomeIcon
  if (icon === "info") {
    library.add(faCircleInfo)
    fontAwesomeIcon = <FontAwesomeIcon icon="fa-solid fa-circle-info" />
  }

  const renderToolTip = (props) => (
    <Tooltip id="button-tooltip" className='text-gray-800' {...props}>
      {message}
    </Tooltip>
  );

  return (
    <OverlayTrigger placement={placement}
      delay={{ show: 250, hide: 400 }}
      overlay={renderToolTip}>

      {fontAwesomeIcon}

    </OverlayTrigger>
  )

}

export default ToolTip;