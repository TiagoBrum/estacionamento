var app = angular.module('app',['ngRoute']);

(function () {
  'use strict';
      app.config(function($routeProvider, $locationProvider)
      {
         // remove o # da url
         $locationProvider.html5Mode({
           enabled: true,
           requireBase: true
         });
         moment.locale('pt-br');

         $routeProvider

         // para a rota '/', carregaremos o template home.html e o controller 'HomeCtrl'
         .when('/', {
            templateUrl : 'app/views/carros.html',
            controller     : 'EstacionamentoCtrl',
         })

         // para a rota '/sobre', carregaremos o template sobre.html e o controller 'SobreCtrl'
         .when('/tabela', {
            templateUrl : 'app/views/tabela.html',
            controller  : 'TabelaCtrl',
         })

         // caso não seja nenhum desses, redirecione para a rota '/'
         .otherwise ({ redirectTo: '/' });
      });
})();

(function () {
  'use strict';
    app.directive('timeNow', function($interval) {
      return {
        restrict: 'AE',
        link: function(scope, element, attrs){
          var timer = $interval(function(){
            atualizaTempo();
          },1000);

          function atualizaTempo(){
            element.text(moment().format('dddd') + ', ' + moment().format('LL') + ', ' + moment().format('LTS'));
          }
        }
      }  
    });
})();