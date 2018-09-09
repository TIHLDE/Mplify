import React, {Component} from 'react';
import BOARD from '../../‫Images/SALT_board.png';

class MemberBoard extends Component{

    constructor(props) {
        super(props);

        this.canvasRef = React.createRef();
        this.imageRef = React.createRef();

        this.memberIdText = 'Medlemsnr: ' + props.member.user_id;
    }

    componentDidMount() {
        this.updateCanvas();
    }

    updateCanvas() {
        const canvas = this.canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = this.imageRef.current;

        img.onload = () => {
            ctx.drawImage(img, 0, 0);
            ctx.font = "16px Segoe Script";
            ctx.fillStyle = "White";
            ctx.fillText(this.memberIdText, 190, 75);
            ctx.font = "20px Segoe Script";
            ctx.fillText(this.props.member.first_name, 190, 110);
            ctx.fillText(this.props.member.last_name, 190, 140);
        }
    }

    render() {
        return (
            <div>
                <canvas ref={this.canvasRef} width={400} height={230} />
                <img ref={this.imageRef} src={BOARD} alt={''} hidden={true} />
            </div>
        );
    }
}

export default MemberBoard;