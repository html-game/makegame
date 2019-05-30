var ImageManager = function () {

	// �C���[�W�i�[�p���X�g
	this.images = new Array();
	this.imagesCount = 0;
	// �C���[�W���[�h�����J�E���g
	this.loadCount = 0;
	
};

/**
 * ImageManager�����o��`
 */
ImageManager.prototype = {

	/**
	 * �C���[�W��ǉ�����B
	 */
	addImage : function (imgUrl) {
	
		// �C���[�W�𐶐�����
		var img = new Image();
		img.src = imgUrl;
		// ���X�g�ɐݒ肷��
		this.images[imgUrl] = img;
		this.imagesCount++;
	},
	
	/**
	 * �C���[�W���擾����B
	 */
	getImage : function (imgUrl) {
	
		return this.images[imgUrl];
	},

	/**
	 * ���[�h���ꂽ�C���[�W�̌������J�E���g����B
	 */
	countLoadedImages : function () {
	
		this.loadCount = 0;
		
		// �C���[�W���������[�h����
		for (var imgUrl in this.images) {
			
			var img = this.images[imgUrl];
			
			if (img.complete) {
			
				this.loadCount++;
			}
		}
	}, 
	
	/**
	 * �C���[�W�̃��[�h����B
	 */
	load : function () {
	
		var me = this;
		
		// �C���[�W�̃��[�h����������܂őҋ@����֐�
		var wait = function() {
		
			me.countLoadedImages();
			
			if (me.loadCount < me.imagesCount) {
			
				window.setTimeout(wait, 10);
			}
		};
		
		wait();
		
	}
};