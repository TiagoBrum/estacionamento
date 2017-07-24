(function () {
  'use strict';
  app.controller('EstacionamentoCtrl', ['$rootScope', '$scope', '$location', '$filter', function ($rootScope, $scope, $location, $filter)
		{
			$rootScope.activetab = $location.path();
			var self = $scope;

			self.modelAux = {placaVeiculo: null, chegada: null, saida: null, duracao:null, tCobrado:null, preco:null, valor:null};
            self.placaVeiculo = null;

            self.modelEstacionamento = [];

			self.tools = {
				setTime: function() {
					return moment().format('L') + ' ' + moment().format('LTS');
				},
                clearEntrada: function () {
                    self.msg = null;
					self.modelAux = {placaVeiculo: null, chegada: null, saida: null, duracao:null, tCobrado:null, preco:null, valor:null};
					$('#collapseEntrada').collapse('hide');
                },
                cancelSaida: function () {
                    self.msg = null;
                    self.placaVeiculo = null;
                    self.modelAux.saida = null;
                    self.modelAux.duracao = null;
                    self.modelAux.tCobrado = null;
                    self.modelAux.preco = null;
                    self.modelAux.valor = null;
                    $('#collapseSaida').collapse('hide');
                },
                addVeiculo: function () {
                    //verifica intervalo de valor para pegar preco/hora
                    var dataEntrada = moment(self.modelAux.chegada, 'DD/MM/YYYY HH:mm:ss a');
                    if (!dataEntrada.isValid()) {
                        self.msg = "Data de entrada inválida";
                        return false;
                    }

                    //traz tabela de precos salva no localStorage
                    var tabela = JSON.parse(localStorage.getItem("tbTabela"));
                    if (tabela != null && tabela.length > 0) {
                        angular.forEach(tabela, function (obj) {
                            var data1 = moment(obj.inicio, 'DD/MM/YYYY');
                            var data2 = moment(obj.fim, 'DD/MM/YYYY');
                            var diffDays1 = dataEntrada.diff(data1, 'days');
                            var diffDays2 = dataEntrada.diff(data2, 'days');
                            if (diffDays1 >= 0 && diffDays2 <= 0) {
                                $scope.modelAux.preco = obj.horaInicio;
                                $scope.modelAux.horaAdd = obj.horaAdd;
                            }
                        });
                    } else {
                        self.msg = "Não ha tabela de preços cadastras, por favor insira uma para poder continuar.";
                        return false;
                    }

					self.modelEstacionamento.push(angular.copy(self.modelAux));
					//armazena usando localStorage no broswer
					localStorage.setItem("tbEstacionamento", JSON.stringify(self.modelEstacionamento));
					//limpa o form de entrada
					self.tools.clearEntrada();
                },
                buscaVeiculo: function () {
                    self.modelAux = $filter('filter')(self.modelEstacionamento, { placaVeiculo: self.placaVeiculo });

                    if (self.modelAux.length > 0) {
                        self.modelAux = self.modelAux[0];
                        self.msg = null;

                    } else {
                        self.msg = "Veiculo não encontrado";
                        return false;
                    }
                    
                },
				recuperaRegistros: function() {
					//recupera os dados salvos no local storage
					var reg = localStorage.getItem("tbEstacionamento");
					reg     = JSON.parse(reg);

                    if (reg === null) return;

					self.modelEstacionamento = reg;
				},
				calculaValor: function() {
                    var data1 = moment(self.modelAux.chegada, 'DD/MM/YYYY HH:mm:ss a');
                    var data2 = moment(self.modelAux.saida, 'DD/MM/YYYY HH:mm:ss a');

                    if (!data2.isValid()) {
                        self.msg = "Data de saída é inválida.";
                        return false;
                    }

                    var diffDays = data2.diff(data1, 'days');
                    if (diffDays < 0) {
                        self.msg = "Período Invalido, data saída não pode ser superior a data de entrada."
                        return false;
                    }

                    var valorPagar = 0;
                    var horas = data2.diff(data1, 'hours');
                    if (horas > 0) {
                        valorPagar = parseFloat(self.modelAux.preco);
                        horas = horas - 1;
                        if (horas > 0) valorPagar += horas * parseFloat(self.modelAux.horaAdd);
                        data2 = data2.subtract(horas + 1, 'hours');
                        var minutos = data2.diff(data1, 'minutes');
                        var minutos2 = (minutos > 10) ? minutos : '0' + minutos;
                        self.modelAux.duracao = (horas + 1) + ':' + minutos2 + ':00';
                        if (minutos > 10) {
                            valorPagar += parseFloat(self.modelAux.horaAdd);
                            horas += 1;
                        }                        
                        self.modelAux.tCobrado = (horas+1) + ':00:00';
                    } else {
                        var minutos = data2.diff(data1, 'minutes');
                        if (minutos <= 30) {
                            valorPagar = parseFloat(self.modelAux.preco) / 2;
                            minutos = (minutos > 10) ? minutos : '0' + minutos;
                            self.modelAux.tCobrado = '00:' + minutos + ':00';
                            self.modelAux.duracao = '00:' + minutos + ':00';
                        } else {
                            minutos = (minutos > 10) ? minutos : '0' + minutos;
                            self.modelAux.duracao = '00:' + minutos + ':00';
                            self.modelAux.tCobrado = '01:00:00';
                            valorPagar = parseFloat(self.modelAux.preco)
                        }
                    }
                    self.modelAux.valor = valorPagar;
                    return true;
                },
                confirmaSaida: function () {
                    if (self.modelAux.valor != null && self.modelAux.valor > 0) {
                        self.msg = null;
                        self.placaVeiculo = null;
                        self.modelAux = { placaVeiculo: null, chegada: null, saida: null, duracao: null, tCobrado: null, preco: null, valor: null };
                        //armazena usando localStorage no broswer
                        localStorage.setItem("tbEstacionamento", JSON.stringify(self.modelEstacionamento));
                        $('#collapseSaida').collapse('hide');
                    } else {
                        self.msg = "Por favor calcule o valor a ser pago primeiro. (icone calculadora ao lado da data de saída";
                    }
                },
			};

			self.tools.recuperaRegistros();
		}]);
})();

(function () {
  'use strict';
		app.controller('TabelaCtrl', function($rootScope, $scope, $location)
		{
			$rootScope.activetab = $location.path();
			var self             = $scope;
			self.modelAux        = {inicio: null, fim: null, saida: null, horaInicio:null, horaAdd:null};
			self.modelTabela     = [
				{inicio: '12/12/2017', fim: '13/12/2017', horaInicio:2, horaAdd:1},
				{inicio: '12/12/2017', fim: '14/12/2017', horaInicio:2, horaAdd:1}
			];

			self.tools = {
				setDate: function() {
					return moment().format('L');
				},
				clearPeriodo: function() {
					self.modelAux = {inicio: null, fim: null, saida: null, horaInicio:null, horaAdd:null};
					self.msg      = null;
					$('#collapsePeriodo').collapse('hide');
				},
				addPeriodo: function() {
                    if (self.tools.validaPeriodo()) {
                        if (!(self.modelAux.horaInicio > 0) || !(self.modelAux.horaAdd > 0)) {
                            self.msg = "Prencha o valor das horas (inicio e adicional)";
                            return;
                        }
					 	self.modelTabela.push(angular.copy(self.modelAux));

						//armazena usando localStorage no broswer
						localStorage.setItem("tbTabela", JSON.stringify(self.modelTabela));
						//limpa o form de entrada
						self.tools.clearPeriodo();
					 }
				},
				recuperaRegistros: function() {
					//recupera os dados salvos no local storage
					var reg = localStorage.getItem("tbTabela");
					reg     = JSON.parse(reg);

					if(reg === null) reg = [];

					self.modelTabela = reg;
				},
				validaPeriodo: function() {
                    var data1 = moment(self.modelAux.inicio, 'D/M/YYYY');
                    var data2 = moment(self.modelAux.fim, 'D/M/YYYY');

                    if (!data1.isValid() || !data2.isValid()) {
                        self.msg = "Período Invalido, data incial ou final é inválida.";
                        return false;
                    }

                    var diffDays = data2.diff(data1, 'days');
                    var periodo = false;
                    angular.forEach(self.modelTabela, function (obj) {
                        var dTabela1 = moment(obj.inicio, 'DD/MM/YYYY');
                        var dTabela2 = moment(obj.fim, 'DD/MM/YYYY');
                        var d1 = data1.diff(dTabela1, 'days');
                        var d2 = data1.diff(dTabela2, 'days');
                        if (d1 >= 0 && d2 <= 0) {
                            periodo = true;
                        }
                        var d1 = data2.diff(dTabela1, 'days');
                        var d2 = data2.diff(dTabela2, 'days');
                        if (d1 >= 0 && d2 <= 0) {
                            periodo = true;
                        }
                    });

                    if (periodo) {
                        self.msg = "Preiodo inválido. Uma das datas converge com um período já cadastrado.";
                        return false;
                    }

					if(diffDays >= 0 ) return true;

					self.msg = "Período Invalido, data incial não pode ser superior a data final.";
					return false;
				}
			};
			self.tools.recuperaRegistros();
		});
})();