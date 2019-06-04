//敵の定義
const _ENEMIES_CONTROL = {
	_collisions_obj: [],
	_reset() {
		this._collisions_obj = [];
	},
	_def_collision_type: { //爆発タイプ変数定義
		t0: 't0',
		t1: 't1',
		t2: 't2',
		t3: 't3',
		t8: 't8',
		t9: 't9',
	},
	_add_collisions(_p) {
		if (_p && _p.ct === this._def_collision_type.t0) {
			this._collisions_obj.push(new GameObject_ENEMY_COLLISION_TYPE0({
				x: _p.x,
				y: _p.y
			}));
		}
		if (_p && _p.ct === this._def_collision_type.t1) {
			this._collisions_obj.push(new GameObject_ENEMY_COLLISION_TYPE1({
				x: _p.x,
				y: _p.y
			}));
		}
		if (_p && _p.ct === this._def_collision_type.t2) {
			this._collisions_obj.push(new GameObject_ENEMY_COLLISION_TYPE2({
				x: _p.x,
				y: _p.y
			}));
		}
		if (_p && _p.ct === this._def_collision_type.t3) {
			this._collisions_obj.push(new GameObject_ENEMY_COLLISION_TYPE3({
				x: _p.x,
				y: _p.y
			}));
		}
		if (_p && _p.ct === this._def_collision_type.t8) {
			this._collisions_obj.push(new GameObject_ENEMY_COLLISION_TYPE8({
				x: _p.x,
				y: _p.y
			}));
		}
		if (_p && _p.ct === this._def_collision_type.t9) {
			this._collisions_obj.push(new GameObject_ENEMY_COLLISION_TYPE9({
				x: _p.x,
				y: _p.y
			}));
		}
	},
	_move_collisions() {
		for (let _i = this._collisions_obj.length - 1; _i >= 0; _i--) {
			let _o = this._collisions_obj[_i];
			if (!_o.isalive()) {
				this._collisions_obj.splice(_i, 1);
			}
			_o.move();
		}
	},
	_draw_collisions() {
		this._collisions_obj.forEach((_o) => {
			_o.setDrawImage();
		});
	}
};


class GameObject_ENEMY_COLLISION {
	constructor(_p) {
		this.x = _p.x || 0;
		this.y = _p.y || 0;
		this.img = _p.img;
		this.imgPos = _p.imgPos;
		this.aniItv = _p.aniItv || 5;
		this._status = true;
		this.width = this.imgPos[1];
		this.height = this.img.height;
		this._c = 0;
	}
	isalive() {
		return this._status;
	}
	set_imgPos() {
		this._c = (this._c >= (this.imgPos.length * this.aniItv) - 1) ? 0 : this._c + 1;
	}
	get_imgPos() {
		return this.imgPos[parseInt(this._c / this.aniItv)]
	}
	setDrawImage() {
		//爆発を表示
		_GAME._setDrawImage({
			img: this.img,
			imgPosx: this.get_imgPos(),
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height
		});
	}
	move() {
		if (this._c >= (this.imgPos.length * this.aniItv) - 1) {
			//アニメーションが終わったら終了
			this._status = false;
			return;
		}

		this.set_imgPos();
		this.x = _MAP.getX(this.x);
		this.y = _MAP.getY(this.y);
	}
}

class GameObject_ENEMY_COLLISION_TYPE0
extends GameObject_ENEMY_COLLISION {
	constructor(_p) {
		super({
			x: _p.x,
			y: _p.y,
			imgPos: [0, 30, 60, 90, 120],
			img: _CANVAS_ASSETS._get_imgs('enemy_collapes0')
		});
	}
}

class GameObject_ENEMY_COLLISION_TYPE1
extends GameObject_ENEMY_COLLISION {
	constructor(_p) {
		super({
			x: _p.x,
			y: _p.y,
			imgPos: [0, 55, 110, 165, 220],
			img: _CANVAS_ASSETS._get_imgs('enemy_collapes1')
		});
	}
}

class GameObject_ENEMY_COLLISION_TYPE2
extends GameObject_ENEMY_COLLISION {
	constructor(_p) {
		super({
			x: _p.x,
			y: _p.y,
			imgPos: [0, 30, 60, 90, 120, 150, 180],
			img: _CANVAS_ASSETS._get_imgs('enemy_collapes2')
		});
	}
}

class GameObject_ENEMY_COLLISION_TYPE3
extends GameObject_ENEMY_COLLISION {
	constructor(_p) {
		super({
			x: _p.x,
			y: _p.y,
			imgPos: [0, 50, 100, 150, 200],
			img: _CANVAS_ASSETS._get_imgs('enemy_collapes3')
		});
	}
}

class GameObject_ENEMY_COLLISION_TYPE8
extends GameObject_ENEMY_COLLISION {
	constructor(_p) {
		super({
			x: _p.x,
			y: _p.y,
			imgPos: [0, 90, 180, 270, 360, 450, 540],
			img: _CANVAS_ASSETS._get_imgs('enemy_collapes8')
		});
	}
}

class GameObject_ENEMY_COLLISION_TYPE9
extends GameObject_ENEMY_COLLISION {
	constructor(_p) {
		super({
			x: _p.x,
			y: _p.y,
			imgPos: [0, 200, 400, 600, 800],
			img: _CANVAS_ASSETS._get_imgs('enemy_collapes9')
		});
	}
}